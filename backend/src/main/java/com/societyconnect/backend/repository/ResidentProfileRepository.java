package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.ResidentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResidentProfileRepository extends JpaRepository<ResidentProfile, Long> {
    Optional<ResidentProfile> findByUserId(Long userId);
}
