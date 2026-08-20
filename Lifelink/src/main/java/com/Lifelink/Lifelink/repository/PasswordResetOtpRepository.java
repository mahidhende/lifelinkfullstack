package com.Lifelink.Lifelink.repository;

import com.Lifelink.Lifelink.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(String email);
    Optional<PasswordResetOtp> findTopByEmailAndOtpCodeAndUsedFalseOrderByExpiryTimeDesc(String email, String otpCode);
}
