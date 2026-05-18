package com.societyconnect.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String providerName;
    private String residentName;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String status;
    private BigDecimal totalPrice;
    private BigDecimal platformFee;
    private BigDecimal protectionFee;
    private BigDecimal emergencyFee;
    private BigDecimal providerPayout;
    private BigDecimal commissionAmount;
    private Boolean protectedBooking;
    private Boolean emergencyBooking;
    private String paymentStatus;
    private String paymentScreenshotUrl;
    private String providerEta;

    private String providerPhone;
    private String residentPhone;
    private boolean isReviewed;
    private Long providerId;
    private Double providerLat;
    private Double providerLng;
    private String bookingDetails;
    private String timeline;
    private String guaranteeStatus;
    private Integer reworkWindowDays;
    private String disputeStatus;
    private String disputeReason;
    private String paymentGateway;
    private String gatewayOrderId;

    public BookingResponse() {}
    public BookingResponse(Long id, Long serviceId, String serviceName, String providerName, String residentName,
                           LocalDate bookingDate, LocalTime bookingTime, String status, BigDecimal totalPrice,
                           String paymentStatus, String paymentScreenshotUrl, String providerEta,
                           String providerPhone, String residentPhone, boolean isReviewed,
                           Long providerId, Double providerLat, Double providerLng, String bookingDetails) {
        this.id = id; this.serviceId = serviceId; this.serviceName = serviceName; this.providerName = providerName;
        this.residentName = residentName; this.bookingDate = bookingDate; this.bookingTime = bookingTime;
        this.status = status; this.totalPrice = totalPrice;
        this.paymentStatus = paymentStatus; this.paymentScreenshotUrl = paymentScreenshotUrl; this.providerEta = providerEta;
        this.providerPhone = providerPhone; this.residentPhone = residentPhone; this.isReviewed = isReviewed;
        this.providerId = providerId; this.providerLat = providerLat; this.providerLng = providerLng;
        this.bookingDetails = bookingDetails;
    }

    public BookingResponse(Long id, Long serviceId, String serviceName, String providerName, String residentName,
                           LocalDate bookingDate, LocalTime bookingTime, String status, BigDecimal totalPrice,
                           BigDecimal platformFee, BigDecimal protectionFee, Boolean protectedBooking, Boolean emergencyBooking,
                           String paymentStatus, String paymentScreenshotUrl, String providerEta,
                           String providerPhone, String residentPhone, boolean isReviewed,
                           Long providerId, Double providerLat, Double providerLng, String bookingDetails) {
        this(id, serviceId, serviceName, providerName, residentName, bookingDate, bookingTime, status, totalPrice,
                paymentStatus, paymentScreenshotUrl, providerEta, providerPhone, residentPhone, isReviewed,
                providerId, providerLat, providerLng, bookingDetails);
        this.platformFee = platformFee;
        this.protectionFee = protectionFee;
        this.protectedBooking = protectedBooking;
        this.emergencyBooking = emergencyBooking;
    }

    public BookingResponse(Long id, Long serviceId, String serviceName, String providerName, String residentName,
                           LocalDate bookingDate, LocalTime bookingTime, String status, BigDecimal totalPrice,
                           BigDecimal platformFee, BigDecimal protectionFee, BigDecimal emergencyFee,
                           BigDecimal providerPayout, BigDecimal commissionAmount,
                           Boolean protectedBooking, Boolean emergencyBooking,
                           String paymentStatus, String paymentScreenshotUrl, String providerEta,
                           String providerPhone, String residentPhone, boolean isReviewed,
                           Long providerId, Double providerLat, Double providerLng, String bookingDetails,
                           String timeline, String guaranteeStatus, Integer reworkWindowDays, String disputeStatus,
                           String disputeReason, String paymentGateway, String gatewayOrderId) {
        this(id, serviceId, serviceName, providerName, residentName, bookingDate, bookingTime, status, totalPrice,
                platformFee, protectionFee, protectedBooking, emergencyBooking, paymentStatus, paymentScreenshotUrl,
                providerEta, providerPhone, residentPhone, isReviewed, providerId, providerLat, providerLng, bookingDetails);
        this.emergencyFee = emergencyFee;
        this.providerPayout = providerPayout;
        this.commissionAmount = commissionAmount;
        this.timeline = timeline;
        this.guaranteeStatus = guaranteeStatus;
        this.reworkWindowDays = reworkWindowDays;
        this.disputeStatus = disputeStatus;
        this.disputeReason = disputeReason;
        this.paymentGateway = paymentGateway;
        this.gatewayOrderId = gatewayOrderId;
    }
    public Long getId() { return id; }
    public Long getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }
    public String getProviderName() { return providerName; }
    public String getResidentName() { return residentName; }
    public LocalDate getBookingDate() { return bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public String getStatus() { return status; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public BigDecimal getProtectionFee() { return protectionFee; }
    public BigDecimal getEmergencyFee() { return emergencyFee; }
    public BigDecimal getProviderPayout() { return providerPayout; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public Boolean getProtectedBooking() { return protectedBooking; }
    public Boolean getEmergencyBooking() { return emergencyBooking; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentScreenshotUrl() { return paymentScreenshotUrl; }
    public String getProviderEta() { return providerEta; }
    public String getProviderPhone() { return providerPhone; }
    public String getResidentPhone() { return residentPhone; }
    public boolean getIsReviewed() { return isReviewed; }
    public Long getProviderId() { return providerId; }
    public Double getProviderLat() { return providerLat; }
    public Double getProviderLng() { return providerLng; }
    public String getBookingDetails() { return bookingDetails; }
    public void setBookingDetails(String bookingDetails) { this.bookingDetails = bookingDetails; }
    public String getTimeline() { return timeline; }
    public String getGuaranteeStatus() { return guaranteeStatus; }
    public Integer getReworkWindowDays() { return reworkWindowDays; }
    public String getDisputeStatus() { return disputeStatus; }
    public String getDisputeReason() { return disputeReason; }
    public String getPaymentGateway() { return paymentGateway; }
    public String getGatewayOrderId() { return gatewayOrderId; }
}
