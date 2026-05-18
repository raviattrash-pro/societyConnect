package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.ReviewRequest;
import com.societyconnect.backend.dto.response.ReviewResponse;
import com.societyconnect.backend.entity.Booking;
import com.societyconnect.backend.entity.Review;
import com.societyconnect.backend.entity.enums.BookingStatus;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.BookingRepository;
import com.societyconnect.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private BookingRepository bookingRepository;

    public ReviewResponse addReview(ReviewRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.COMPLETED) throw new BadRequestException("You can only review completed bookings");
        if (reviewRepository.findByBookingId(request.getBookingId()).isPresent()) throw new BadRequestException("Already reviewed");
        Review review = new Review();
        review.setBooking(booking);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        reviewRepository.save(review);
        return mapToResponse(review);
    }

    public List<ReviewResponse> getProviderReviews(Long providerId) {
        return reviewRepository.findByProviderId(providerId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(review.getId(), review.getBooking().getId(), review.getRating(),
                review.getComment(), review.getBooking().getResident().getFullName(), review.getCreatedAt());
    }
}
