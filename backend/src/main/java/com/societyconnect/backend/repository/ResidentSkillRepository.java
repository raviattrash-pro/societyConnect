package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.ResidentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidentSkillRepository extends JpaRepository<ResidentSkill, Long> {
    List<ResidentSkill> findByIsActiveTrue();
    List<ResidentSkill> findByResidentId(Long residentId);
}
