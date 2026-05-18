package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);

    @Query("SELECT r FROM Review r WHERE r.booking.service.provider.id = :providerId ORDER BY r.createdAt DESC")
    List<Review> findByProviderId(Long providerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.booking.service.provider.id = :providerId")
    Double getAverageRatingByProviderId(Long providerId);

    List<Review> findAllByOrderByCreatedAtDesc();
}
