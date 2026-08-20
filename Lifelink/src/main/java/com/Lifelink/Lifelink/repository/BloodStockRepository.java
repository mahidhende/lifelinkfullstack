package com.Lifelink.Lifelink.repository;

import com.Lifelink.Lifelink.model.BloodStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    List<BloodStock> findByBloodBankId(Long bloodBankId);
    Optional<BloodStock> findByBloodBankIdAndBloodGroup(Long bloodBankId, String bloodGroup);
}
