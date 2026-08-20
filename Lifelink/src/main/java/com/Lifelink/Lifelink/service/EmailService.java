package com.Lifelink.Lifelink.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode, String userName, String role) {
        String subject = "LifeLink Password Reset OTP Code - " + otpCode;
        
        String formattedRole = (role != null ? role.replace("_", " ") : "USER");

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>"
                + "<div style='background: linear-gradient(135deg, #dc2626, #991b1b); padding: 24px; text-align: center; color: white;'>"
                + "<h1 style='margin: 0; font-size: 24px;'>LifeLink Emergency Portal</h1>"
                + "<p style='margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;'>Password Reset Request for " + formattedRole + "</p>"
                + "</div>"
                + "<div style='padding: 30px; background-color: #ffffff; color: #1e293b;'>"
                + "<p style='font-size: 16px; margin-top: 0;'>Hello " + (userName != null ? userName : "User") + ",</p>"
                + "<p style='font-size: 14px; color: #475569;'>You requested to reset your password for your <strong>LifeLink " + formattedRole + "</strong> account. Use the verification OTP code below to proceed with resetting your password:</p>"
                + "<div style='background: #f8fafc; border: 2px dashed #dc2626; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;'>"
                + "<span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626;'>" + otpCode + "</span>"
                + "<p style='margin: 10px 0 0 0; font-size: 12px; color: #64748b;'>This OTP code is valid for 10 minutes. Do not share it with anyone.</p>"
                + "</div>"
                + "<p style='font-size: 13px; color: #94a3b8;'>If you did not request a password reset, please ignore this email.</p>"
                + "</div>"
                + "<div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;'>"
                + "&copy; LifeLink Healthcare Network. Emergency Blood Donation & Delivery System."
                + "</div>"
                + "</div>";

        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println(">>> [EMAIL SUCCESS] Sent OTP " + otpCode + " to " + toEmail);
            } else {
                System.out.println(">>> [EMAIL MOCK / CONSOLE] MailSender not configured. OTP for " + toEmail + " is: " + otpCode);
            }
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARNING] Real email sending failed (" + e.getMessage() + "). Console OTP for " + toEmail + " is: " + otpCode);
        }
    }
}
