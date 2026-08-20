package com.Lifelink.Lifelink.repository;

import com.Lifelink.Lifelink.model.DonationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {
    List<DonationRequest> findByDonorId(Long donorId);
    List<DonationRequest> findByBloodBankId(Long bloodBankId);
    List<DonationRequest> findByBloodBankIdAndStatus(Long bloodBankId, String status);
}
