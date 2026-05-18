package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.BookingRequest;
import com.societyconnect.backend.dto.response.BookingResponse;
import com.societyconnect.backend.entity.*;
import com.societyconnect.backend.entity.enums.BookingStatus;
import com.societyconnect.backend.entity.enums.RoleName;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private ResidentProfileRepository residentProfileRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private ReviewRepository reviewRepository;

    public BookingResponse createBooking(String email, BookingRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Please complete your resident profile first"));
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Booking booking = new Booking();
        booking.setResident(resident);
        booking.setService(service);
        booking.setBookingDate(request.getBookingDate());
        booking.setBookingTime(request.getBookingTime());
        booking.setStatus(Boolean.TRUE.equals(request.getInstantBooking()) ? BookingStatus.ACCEPTED : BookingStatus.PENDING);
        String homeDetails = "Flat: " + nullSafe(resident.getFlatNumber()) + "; Gate: " + nullSafe(resident.getGateInstructions()) + "; Preferred: " + nullSafe(resident.getPreferredTimings());
        booking.setBookingDetails((request.getBookingDetails() != null ? request.getBookingDetails() : "{}") + "\n" + homeDetails);
        booking.setProtectedBooking(Boolean.TRUE.equals(request.getProtectedBooking()) && Boolean.TRUE.equals(service.getProvider().getProtectionEligible()));
        booking.setEmergencyBooking(Boolean.TRUE.equals(request.getEmergencyBooking()));
        BigDecimal platformFee = service.getPrice().multiply(new BigDecimal("0.08")).max(new BigDecimal("20.00"));
        BigDecimal protectionFee = Boolean.TRUE.equals(booking.getProtectedBooking()) ? new BigDecimal("49.00") : BigDecimal.ZERO;
        BigDecimal emergencyFee = Boolean.TRUE.equals(booking.getEmergencyBooking()) ? new BigDecimal("99.00") : BigDecimal.ZERO;
        BigDecimal commission = platformFee.add(protectionFee).add(emergencyFee);
        booking.setPlatformFee(platformFee);
        booking.setProtectionFee(protectionFee);
        booking.setEmergencyFee(emergencyFee);
        booking.setCommissionAmount(commission);
        booking.setProviderPayout(service.getPrice());
        booking.setTotalPrice(service.getPrice().add(platformFee).add(protectionFee).add(emergencyFee));
        booking.setPaymentGateway(request.getPaymentGateway() != null ? request.getPaymentGateway() : "UPI");
        booking.setGatewayOrderId("SC-" + System.currentTimeMillis());
        booking.setTimeline(timelineEntry("REQUESTED", "Booking requested") +
                (booking.getStatus() == BookingStatus.ACCEPTED ? "\n" + timelineEntry("ACCEPTED", "Instant booking accepted") : ""));
        if (Boolean.TRUE.equals(booking.getEmergencyBooking())) {
            int minutes = service.getProvider().getResponseTimeMinutes() != null ? service.getProvider().getResponseTimeMinutes() : 30;
            booking.setProviderEta(minutes + " mins");
            booking.setEstimatedArrivalAt(LocalDateTime.now().plusMinutes(minutes));
        }
        bookingRepository.save(booking);

        // Notify provider
        notificationService.createNotification(service.getProvider().getUser(),
                Boolean.TRUE.equals(booking.getEmergencyBooking()) ? "Emergency Booking Request" : "New Booking Request",
                "You have a new " + (Boolean.TRUE.equals(booking.getEmergencyBooking()) ? "urgent " : "") + "booking for " + service.getServiceName() + " on " + request.getBookingDate(),
                "BOOKING");

        return mapToResponse(booking);
    }

    public List<BookingResponse> getMyBookings(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Booking> bookings;
        if (user.getRole().getName() == RoleName.ROLE_RESIDENT || user.getRole().getName() == RoleName.ROLE_ADMIN) {
            ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            bookings = bookingRepository.findByResidentIdOrderByCreatedAtDesc(resident.getId());
        } else {
            ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            bookings = bookingRepository.findByServiceProviderIdOrderByCreatedAtDesc(provider.getId());
        }
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Autowired private MessageRepository messageRepository;

    public BookingResponse updateBookingStatus(String email, Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        BookingStatus newStatus = BookingStatus.valueOf(status);
        booking.setStatus(newStatus);
        booking.setTimeline(appendTimeline(booking.getTimeline(), newStatus.name(), "Booking marked " + newStatus.name().replace('_', ' ').toLowerCase()));
        if (newStatus == BookingStatus.ON_THE_WAY && booking.getProviderEta() == null) booking.setProviderEta("20 mins");
        if (newStatus == BookingStatus.COMPLETED) {
            ProviderProfile providerProfile = booking.getService().getProvider();
            providerProfile.setMonthlyEarnings((providerProfile.getMonthlyEarnings() != null ? providerProfile.getMonthlyEarnings() : BigDecimal.ZERO).add(booking.getProviderPayout()));
            providerProfile.setReliabilityScore(Math.min(100, (providerProfile.getReliabilityScore() != null ? providerProfile.getReliabilityScore() : 60) + 2));
            providerProfileRepository.save(providerProfile);
            ResidentProfile residentProfile = booking.getResident();
            residentProfile.setLoyaltyPoints((residentProfile.getLoyaltyPoints() != null ? residentProfile.getLoyaltyPoints() : 0) + 25);
            residentProfileRepository.save(residentProfile);
        }
        bookingRepository.save(booking);

        // Notify resident about status change
        User resident = booking.getResident().getUser();
        User provider = booking.getService().getProvider().getUser();
        
        String statusMsg = switch (newStatus) {
            case ACCEPTED -> "Your booking for " + booking.getService().getServiceName() + " has been accepted!";
            case ON_THE_WAY -> "Your provider is on the way for " + booking.getService().getServiceName() + ".";
            case ARRIVED -> "Your provider has arrived for " + booking.getService().getServiceName() + ".";
            case COMPLETED -> "Your booking for " + booking.getService().getServiceName() + " is completed. Please leave a review.";
            case CANCELLED -> "Your booking for " + booking.getService().getServiceName() + " has been cancelled.";
            default -> "Your booking status has been updated to " + newStatus;
        };
        notificationService.createNotification(resident, "Booking Update", statusMsg, "BOOKING");

        // Send automated message if ACCEPTED
        if (newStatus == BookingStatus.ACCEPTED) {
            String resPhone = booking.getResident().getPhone();
            String provPhone = booking.getService().getProvider().getPhone();
            
            Message msg = new Message();
            msg.setSender(provider);
            msg.setReceiver(resident);
            msg.setContent("Hello! I have accepted your booking. My contact number is " + provPhone + ". " +
                           "I also received your contact: " + resPhone + ". Let's chat here or call if needed!");
            messageRepository.save(msg);
        }

        return mapToResponse(booking);
    }

    public BookingResponse updatePayment(String email, Long bookingId, String screenshotUrl, String transactionId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setPaymentScreenshotUrl(screenshotUrl);
        booking.setTransactionId(transactionId);
        booking.setPaymentStatus(com.societyconnect.backend.entity.enums.PaymentStatus.PAID);
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public BookingResponse updateEta(String email, Long bookingId, String eta) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setProviderEta(eta);
        booking.setTimeline(appendTimeline(booking.getTimeline(), "ETA_UPDATED", "ETA updated to " + eta));
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public BookingResponse raiseDispute(String email, Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setDisputeStatus("OPEN");
        booking.setDisputeReason(reason);
        booking.setGuaranteeStatus("CLAIMED");
        booking.setTimeline(appendTimeline(booking.getTimeline(), "DISPUTE_OPEN", "Resident raised a guarantee/dispute request"));
        bookingRepository.save(booking);
        notificationService.createNotification(booking.getService().getProvider().getUser(), "Guarantee Claim", reason, "DISPUTE");
        return mapToResponse(booking);
    }

    public BookingResponse resolveDispute(Long bookingId, String resolution) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setDisputeStatus(resolution != null ? resolution : "RESOLVED");
        booking.setGuaranteeStatus("RESOLVED");
        booking.setTimeline(appendTimeline(booking.getTimeline(), "DISPUTE_RESOLVED", "Admin resolved dispute"));
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public Map<String, Object> getRevenueSummary() {
        List<Booking> all = bookingRepository.findAll();
        BigDecimal gross = all.stream().map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal commission = all.stream().map(b -> b.getCommissionAmount() != null ? b.getCommissionAmount() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal payouts = all.stream().map(b -> b.getProviderPayout() != null ? b.getProviderPayout() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        long disputes = all.stream().filter(b -> b.getDisputeStatus() != null && !"NONE".equals(b.getDisputeStatus())).count();
        return Map.of("grossRevenue", gross, "platformCommission", commission, "providerPayouts", payouts, "disputes", disputes, "totalBookings", all.size());
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getService().getId(), booking.getService().getServiceName(),
                booking.getService().getProvider().getFullName(), booking.getResident().getFullName(),
                booking.getBookingDate(), booking.getBookingTime(), booking.getStatus().name(), booking.getTotalPrice(),
                booking.getPlatformFee(), booking.getProtectionFee(), booking.getEmergencyFee(), booking.getProviderPayout(),
                booking.getCommissionAmount(), booking.getProtectedBooking(), booking.getEmergencyBooking(),
                booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : "PENDING",
                booking.getPaymentScreenshotUrl(), booking.getProviderEta(),
                booking.getService().getProvider().getPhone(), booking.getResident().getPhone(),
                reviewRepository.findByBookingId(booking.getId()).isPresent(),
                booking.getService().getProvider().getId(),
                booking.getService().getProvider().getLatitude(),
                booking.getService().getProvider().getLongitude(),
                booking.getBookingDetails(), booking.getTimeline(), booking.getGuaranteeStatus(),
                booking.getReworkWindowDays(), booking.getDisputeStatus(), booking.getDisputeReason(),
                booking.getPaymentGateway(), booking.getGatewayOrderId());
    }

    private String timelineEntry(String status, String message) {
        return LocalDateTime.now() + "|" + status + "|" + message;
    }

    private String appendTimeline(String timeline, String status, String message) {
        return (timeline == null || timeline.isBlank()) ? timelineEntry(status, message) : timeline + "\n" + timelineEntry(status, message);
    }

    private String nullSafe(String value) {
        return value == null ? "Not saved" : value;
    }
}
