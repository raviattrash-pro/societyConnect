package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);
    List<ProviderProfile> findByCategoryId(Integer categoryId);
    List<ProviderProfile> findByIsVerifiedTrue();

    @Query("SELECT p FROM ProviderProfile p WHERE p.isVerified = true " +
           "AND (LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.bio) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ProviderProfile> searchProviders(String query);
}
