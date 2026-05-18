package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.BookingRequest;
import com.societyconnect.backend.dto.response.BookingResponse;
import com.societyconnect.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<BookingResponse> createBooking(Authentication auth, @RequestBody BookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(auth.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth.getName()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    public ResponseEntity<BookingResponse> updateStatus(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(auth.getName(), id, body.get("status")));
    }

    @PatchMapping("/{id}/payment")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<BookingResponse> updatePayment(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updatePayment(auth.getName(), id, body.get("screenshotUrl"), body.get("transactionId")));
    }

    @PatchMapping("/{id}/eta")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> updateEta(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateEta(auth.getName(), id, body.get("eta")));
    }

    @PatchMapping("/{id}/dispute")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<BookingResponse> raiseDispute(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.raiseDispute(auth.getName(), id, body.get("reason")));
    }

    @PatchMapping("/{id}/dispute/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> resolveDispute(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.resolveDispute(id, body.get("resolution")));
    }

    @GetMapping("/revenue-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> revenueSummary() {
        return ResponseEntity.ok(bookingService.getRevenueSummary());
    }
}
