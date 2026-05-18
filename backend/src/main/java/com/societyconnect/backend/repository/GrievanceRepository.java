package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByUserId(Long userId);
    List<Grievance> findAllByOrderByCreatedAtDesc();
}
