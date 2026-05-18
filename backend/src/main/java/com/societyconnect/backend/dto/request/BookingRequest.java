package com.societyconnect.backend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequest {
    private Long serviceId;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String bookingDetails;
    private Boolean protectedBooking;
    private Boolean emergencyBooking;
    private Boolean instantBooking;
    private String paymentGateway;

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalTime bookingTime) { this.bookingTime = bookingTime; }
    public String getBookingDetails() { return bookingDetails; }
    public void setBookingDetails(String bookingDetails) { this.bookingDetails = bookingDetails; }
    public Boolean getProtectedBooking() { return protectedBooking; }
    public void setProtectedBooking(Boolean protectedBooking) { this.protectedBooking = protectedBooking; }
    public Boolean getEmergencyBooking() { return emergencyBooking; }
    public void setEmergencyBooking(Boolean emergencyBooking) { this.emergencyBooking = emergencyBooking; }
    public Boolean getInstantBooking() { return instantBooking; }
    public void setInstantBooking(Boolean instantBooking) { this.instantBooking = instantBooking; }
    public String getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
}
