package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByProviderId(Long providerId);

    @Query("SELECT s FROM ServiceEntity s WHERE s.provider.user.isEnabled = true AND (" +
           "LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ServiceEntity> searchServices(String query);

    @Query("SELECT s FROM ServiceEntity s WHERE s.provider.user.isEnabled = true AND s.provider.category.id = :categoryId")
    List<ServiceEntity> findByCategoryId(Integer categoryId);

    @Query("SELECT s FROM ServiceEntity s WHERE s.provider.user.isEnabled = true")
    List<ServiceEntity> findAllEnabled();
}
