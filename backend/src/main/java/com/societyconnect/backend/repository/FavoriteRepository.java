package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByResidentId(Long residentId);
    Optional<Favorite> findByResidentIdAndProviderId(Long residentId, Long providerId);
    boolean existsByResidentIdAndProviderId(Long residentId, Long providerId);
    void deleteByResidentIdAndProviderId(Long residentId, Long providerId);
}
