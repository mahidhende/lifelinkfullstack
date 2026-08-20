package com.Lifelink.Lifelink.repository;

import com.Lifelink.Lifelink.model.PatientBloodRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientBloodRequestRepository extends JpaRepository<PatientBloodRequest, Long> {
    List<PatientBloodRequest> findByPatientId(Long patientId);
    List<PatientBloodRequest> findByStatus(String status);
    List<PatientBloodRequest> findByAcceptedByBankId(Long bloodBankId);
}
