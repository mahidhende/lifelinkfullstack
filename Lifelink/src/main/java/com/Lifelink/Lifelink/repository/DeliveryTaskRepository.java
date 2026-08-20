package com.Lifelink.Lifelink.repository;

import com.Lifelink.Lifelink.model.DeliveryTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryTaskRepository extends JpaRepository<DeliveryTask, Long> {
    List<DeliveryTask> findByDeliveryBoyId(Long deliveryBoyId);
    List<DeliveryTask> findByBloodBankId(Long bloodBankId);
    Optional<DeliveryTask> findByPatientRequestId(Long patientRequestId);
    List<DeliveryTask> findByStatus(String status);
}
