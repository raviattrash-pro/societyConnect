package com.societyconnect.backend.entity;

import com.societyconnect.backend.entity.enums.BookingStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private ResidentProfile resident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_time", nullable = false)
    private LocalTime bookingTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "platform_fee", precision = 10, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Column(name = "protection_fee", precision = 10, scale = 2)
    private BigDecimal protectionFee = BigDecimal.ZERO;

    @Column(name = "emergency_fee", precision = 10, scale = 2)
    private BigDecimal emergencyFee = BigDecimal.ZERO;

    @Column(name = "provider_payout", precision = 10, scale = 2)
    private BigDecimal providerPayout = BigDecimal.ZERO;

    @Column(name = "commission_amount", precision = 10, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Column(name = "protected_booking")
    private Boolean protectedBooking = false;

    @Column(name = "emergency_booking")
    private Boolean emergencyBooking = false;

    @Lob
    @Column(name = "payment_screenshot_url", columnDefinition = "LONGTEXT")
    private String paymentScreenshotUrl;

    @Column(name = "transaction_id")
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private com.societyconnect.backend.entity.enums.PaymentStatus paymentStatus = com.societyconnect.backend.entity.enums.PaymentStatus.PENDING;

    @Column(name = "provider_eta")
    private String providerEta;

    @Column(name = "estimated_arrival_at")
    private LocalDateTime estimatedArrivalAt;

    @Column(name = "payment_gateway", length = 40)
    private String paymentGateway = "UPI";

    @Column(name = "gateway_order_id")
    private String gatewayOrderId;

    @Column(name = "guarantee_status", length = 30)
    private String guaranteeStatus = "ACTIVE";

    @Column(name = "rework_window_days")
    private Integer reworkWindowDays = 7;

    @Column(name = "dispute_status", length = 30)
    private String disputeStatus = "NONE";

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "timeline", columnDefinition = "TEXT")
    private String timeline;
    
    @Lob
    @Column(name = "booking_details", columnDefinition = "LONGTEXT")
    private String bookingDetails;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ResidentProfile getResident() { return resident; }
    public void setResident(ResidentProfile resident) { this.resident = resident; }
    public ServiceEntity getService() { return service; }
    public void setService(ServiceEntity service) { this.service = service; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalTime bookingTime) { this.bookingTime = bookingTime; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public BigDecimal getProtectionFee() { return protectionFee; }
    public void setProtectionFee(BigDecimal protectionFee) { this.protectionFee = protectionFee; }
    public BigDecimal getEmergencyFee() { return emergencyFee; }
    public void setEmergencyFee(BigDecimal emergencyFee) { this.emergencyFee = emergencyFee; }
    public BigDecimal getProviderPayout() { return providerPayout; }
    public void setProviderPayout(BigDecimal providerPayout) { this.providerPayout = providerPayout; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }
    public Boolean getProtectedBooking() { return protectedBooking; }
    public void setProtectedBooking(Boolean protectedBooking) { this.protectedBooking = protectedBooking; }
    public Boolean getEmergencyBooking() { return emergencyBooking; }
    public void setEmergencyBooking(Boolean emergencyBooking) { this.emergencyBooking = emergencyBooking; }
    public String getPaymentScreenshotUrl() { return paymentScreenshotUrl; }
    public void setPaymentScreenshotUrl(String paymentScreenshotUrl) { this.paymentScreenshotUrl = paymentScreenshotUrl; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public com.societyconnect.backend.entity.enums.PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(com.societyconnect.backend.entity.enums.PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getProviderEta() { return providerEta; }
    public void setProviderEta(String providerEta) { this.providerEta = providerEta; }
    public LocalDateTime getEstimatedArrivalAt() { return estimatedArrivalAt; }
    public void setEstimatedArrivalAt(LocalDateTime estimatedArrivalAt) { this.estimatedArrivalAt = estimatedArrivalAt; }
    public String getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
    public String getGatewayOrderId() { return gatewayOrderId; }
    public void setGatewayOrderId(String gatewayOrderId) { this.gatewayOrderId = gatewayOrderId; }
    public String getGuaranteeStatus() { return guaranteeStatus; }
    public void setGuaranteeStatus(String guaranteeStatus) { this.guaranteeStatus = guaranteeStatus; }
    public Integer getReworkWindowDays() { return reworkWindowDays; }
    public void setReworkWindowDays(Integer reworkWindowDays) { this.reworkWindowDays = reworkWindowDays; }
    public String getDisputeStatus() { return disputeStatus; }
    public void setDisputeStatus(String disputeStatus) { this.disputeStatus = disputeStatus; }
    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
    public String getTimeline() { return timeline; }
    public void setTimeline(String timeline) { this.timeline = timeline; }
    public String getBookingDetails() { return bookingDetails; }
    public void setBookingDetails(String bookingDetails) { this.bookingDetails = bookingDetails; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
