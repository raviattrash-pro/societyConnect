package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.Booking;
import com.societyconnect.backend.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<Booking> findByServiceProviderIdOrderByCreatedAtDesc(Long providerId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
