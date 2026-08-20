package com.Lifelink.Lifelink.service;

import com.Lifelink.Lifelink.model.*;
import com.Lifelink.Lifelink.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LifeLinkService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BloodStockRepository bloodStockRepository;

    @Autowired
    private DonationRequestRepository donationRequestRepository;

    @Autowired
    private PatientBloodRequestRepository patientBloodRequestRepository;

    @Autowired
    private DeliveryTaskRepository deliveryTaskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // --- DONOR SERVICES ---

    public DonationRequest createDonationRequest(DonationRequest req) {
        if (req.getDonorId() != null) {
            userRepository.findById(req.getDonorId()).ifPresent(u -> {
                req.setDonorName(u.getName());
                req.setDonorPhone(u.getPhone());
                if (req.getBloodGroup() == null) req.setBloodGroup(u.getBloodGroup());
            });
        }
        if (req.getBloodBankId() != null) {
            userRepository.findById(req.getBloodBankId()).ifPresent(b -> {
                req.setBloodBankName(b.getName());
            });
        }

        DonationRequest saved = donationRequestRepository.save(req);

        // Notify blood bank
        createNotification(req.getBloodBankId(),
                "New Blood Donation Request from " + req.getDonorName() + " (" + req.getBloodGroup() + ", " + req.getQuantityMl() + "ml)",
                "DONATION_UPDATE");

        return saved;
    }

    public List<DonationRequest> getDonorDonationHistory(Long donorId) {
        return donationRequestRepository.findByDonorId(donorId);
    }

    // --- PATIENT SERVICES ---

    public PatientBloodRequest createPatientBloodRequest(PatientBloodRequest req) {
        if (req.getPatientId() != null) {
            userRepository.findById(req.getPatientId()).ifPresent(p -> {
                req.setPatientName(p.getName());
                req.setPatientPhone(p.getPhone());
                if (req.getDeliveryAddress() == null) req.setDeliveryAddress(p.getAddress());
                if (req.getHospitalName() == null) req.setHospitalName(p.getHospitalName());
            });
        }

        req.setStatus("PENDING");
        PatientBloodRequest saved = patientBloodRequestRepository.save(req);

        // Notify all blood banks
        List<User> bloodBanks = userRepository.findByRole("BLOOD_BANK");
        for (User bank : bloodBanks) {
            createNotification(bank.getId(),
                    "EMERGENCY/BLOOD REQUEST: Patient " + saved.getPatientName() + " needs " + saved.getUnitsInMl() + "ml of " + saved.getBloodGroup(),
                    "PATIENT_REQUEST");
        }

        return saved;
    }

    public List<PatientBloodRequest> getPatientRequests(Long patientId) {
        return patientBloodRequestRepository.findByPatientId(patientId);
    }

    // --- BLOOD BANK SERVICES ---

    public List<BloodStock> getBloodBankStock(Long bloodBankId) {
        return bloodStockRepository.findByBloodBankId(bloodBankId);
    }

    public BloodStock addOrUpdateStock(Long bloodBankId, String bloodGroup, Integer quantityMl) {
        User bank = userRepository.findById(bloodBankId).orElse(null);
        String bankName = bank != null ? bank.getName() : "Blood Bank #" + bloodBankId;

        Optional<BloodStock> opt = bloodStockRepository.findByBloodBankIdAndBloodGroup(bloodBankId, bloodGroup);
        BloodStock stock;
        if (opt.isPresent()) {
            stock = opt.get();
            stock.setQuantityMl(stock.getQuantityMl() + quantityMl);
        } else {
            stock = BloodStock.builder()
                    .bloodBankId(bloodBankId)
                    .bloodBankName(bankName)
                    .bloodGroup(bloodGroup)
                    .quantityMl(quantityMl)
                    .build();
        }
        return bloodStockRepository.save(stock);
    }

    public List<DonationRequest> getBloodBankDonorRequests(Long bloodBankId) {
        return donationRequestRepository.findByBloodBankId(bloodBankId);
    }

    @Transactional
    public DonationRequest updateDonationStatus(Long donationId, String status) {
        DonationRequest req = donationRequestRepository.findById(donationId).orElse(null);
        if (req == null) return null;

        req.setStatus(status);
        DonationRequest updated = donationRequestRepository.save(req);

        if ("ACCEPTED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            // Auto add to inventory stock
            addOrUpdateStock(req.getBloodBankId(), req.getBloodGroup(), req.getQuantityMl());
            createNotification(req.getDonorId(),
                    "Your blood donation request of " + req.getQuantityMl() + "ml (" + req.getBloodGroup() + ") has been accepted by " + req.getBloodBankName() + "!",
                    "DONATION_UPDATE");
        }
        return updated;
    }

    public List<PatientBloodRequest> getAllPendingPatientRequests() {
        return patientBloodRequestRepository.findByStatus("PENDING");
    }

    @Transactional
    public PatientBloodRequest acceptPatientRequestByBank(Long requestId, Long bloodBankId) {
        PatientBloodRequest pReq = patientBloodRequestRepository.findById(requestId).orElse(null);
        if (pReq == null || !"PENDING".equalsIgnoreCase(pReq.getStatus())) {
            return pReq; // Already accepted or invalid
        }

        User bank = userRepository.findById(bloodBankId).orElse(null);
        String bankName = bank != null ? bank.getName() : "Blood Bank #" + bloodBankId;
        String bankAddr = bank != null ? bank.getAddress() : "Main Center";

        // Deduct inventory if stock exists
        Optional<BloodStock> stockOpt = bloodStockRepository.findByBloodBankIdAndBloodGroup(bloodBankId, pReq.getBloodGroup());
        if (stockOpt.isPresent()) {
            BloodStock stock = stockOpt.get();
            int remaining = Math.max(0, stock.getQuantityMl() - pReq.getUnitsInMl());
            stock.setQuantityMl(remaining);
            bloodStockRepository.save(stock);
        }

        // Update Patient Request Status
        pReq.setStatus("ACCEPTED");
        pReq.setAcceptedByBankId(bloodBankId);
        pReq.setAcceptedByBankName(bankName);
        PatientBloodRequest savedReq = patientBloodRequestRepository.save(pReq);

        // Find available Delivery Boy
        List<User> deliveryBoys = userRepository.findByRole("DELIVERY_BOY");
        User assignedBoy = deliveryBoys.isEmpty() ? null : deliveryBoys.get(0);

        // Create Delivery Task
        DeliveryTask task = DeliveryTask.builder()
                .patientRequestId(savedReq.getId())
                .patientName(savedReq.getPatientName())
                .patientPhone(savedReq.getPatientPhone())
                .deliveryAddress(savedReq.getDeliveryAddress())
                .bloodBankId(bloodBankId)
                .bloodBankName(bankName)
                .bloodBankAddress(bankAddr)
                .bloodGroup(savedReq.getBloodGroup())
                .unitsInMl(savedReq.getUnitsInMl())
                .deliveryBoyId(assignedBoy != null ? assignedBoy.getId() : null)
                .deliveryBoyName(assignedBoy != null ? assignedBoy.getName() : "Assigning...")
                .deliveryBoyPhone(assignedBoy != null ? assignedBoy.getPhone() : "")
                .status("PENDING_ASSIGNMENT")
                .build();

        deliveryTaskRepository.save(task);

        // Send notifications to Patient and Delivery Boy
        createNotification(savedReq.getPatientId(),
                "Your request for " + savedReq.getUnitsInMl() + "ml (" + savedReq.getBloodGroup() + ") has been ACCEPTED by " + bankName + ". Delivery is being dispatched!",
                "PATIENT_REQUEST");

        if (assignedBoy != null) {
            createNotification(assignedBoy.getId(),
                    "New Blood Express Delivery Task assigned! Pickup at " + bankName + " -> Deliver to " + savedReq.getPatientName(),
                    "DELIVERY_UPDATE");
        }

        return savedReq;
    }

    // --- DELIVERY BOY SERVICES ---

    public List<DeliveryTask> getDeliveryTasksForBoy(Long deliveryBoyId) {
        List<DeliveryTask> tasks = deliveryTaskRepository.findByDeliveryBoyId(deliveryBoyId);
        if (tasks.isEmpty()) {
            return deliveryTaskRepository.findAll(); // Show available tasks if none strictly assigned
        }
        return tasks;
    }

    public List<DeliveryTask> getAllDeliveryTasks() {
        return deliveryTaskRepository.findAll();
    }

    @Transactional
    public DeliveryTask updateDeliveryStatus(Long taskId, Long deliveryBoyId, String newStatus) {
        DeliveryTask task = deliveryTaskRepository.findById(taskId).orElse(null);
        if (task == null) return null;

        if (deliveryBoyId != null) {
            userRepository.findById(deliveryBoyId).ifPresent(boy -> {
                task.setDeliveryBoyId(boy.getId());
                task.setDeliveryBoyName(boy.getName());
                task.setDeliveryBoyPhone(boy.getPhone());
            });
        }

        task.setStatus(newStatus);
        if ("IN_TRANSIT".equalsIgnoreCase(newStatus)) {
            task.setPickedUpTime(LocalDateTime.now());
        } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            task.setDeliveredTime(LocalDateTime.now());

            // Sync with Patient Blood Request
            patientBloodRequestRepository.findById(task.getPatientRequestId()).ifPresent(req -> {
                req.setStatus("FULFILLED");
                patientBloodRequestRepository.save(req);
            });
        }

        DeliveryTask updated = deliveryTaskRepository.save(task);

        // Notify Patient & Blood Bank
        patientBloodRequestRepository.findById(task.getPatientRequestId()).ifPresent(req -> {
            createNotification(req.getPatientId(),
                    "Delivery Status Update for your blood order: " + newStatus.replace("_", " "),
                    "DELIVERY_UPDATE");
        });

        if (task.getBloodBankId() != null) {
            createNotification(task.getBloodBankId(),
                    "Delivery Task #" + task.getId() + " status changed to: " + newStatus.replace("_", " "),
                    "DELIVERY_UPDATE");
        }

        return updated;
    }

    // --- NOTIFICATION SERVICES ---

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void createNotification(Long userId, String message, String type) {
        if (userId == null) return;
        Notification n = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(n);
    }

    public List<User> getAllUsersByRole(String role) {
        return userRepository.findByRole(role.toUpperCase());
    }
}
