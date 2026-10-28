package com.ulms.util;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(toEmail);
            message.setSubject("Mã OTP xác thực tài khoản");
            message.setText(
                    "Xin chào,\n\n" +
                            "Mã OTP của bạn là: " + otp + "\n\n" +
                            "Mã OTP có hiệu lực trong 5 phút.\n" +
                            "Vui lòng không chia sẻ mã này cho người khác.\n\n" +
                            "Trân trọng."
            );

            mailSender.send(message);
            System.out.println(">>> [EMAIL SERVICE] Đã gửi email OTP thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL SERVICE WARNING] Lỗi gửi email qua SMTP: " + e.getMessage());
            System.err.println(">>> [EMAIL SERVICE] >>> MÃ OTP XÁC THỰC CỦA " + toEmail + " LÀ: " + otp + " <<<");
        }
    }
}