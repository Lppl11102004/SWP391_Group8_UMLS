package com.ulms;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CrackTemp {
    public static void main(String[] args) {
        BCryptPasswordEncoder b = new BCryptPasswordEncoder();
        String hash = "$2a$10$uAwMeec23TeetoNePSXx9O5QKYJytjj9nBaNeNXUlzlXoN8G3bzYG";
        for (int i = 1000; i < 10000; i++) {
            String p = "Ulms@" + i;
            if (b.matches(p, hash)) {
                System.out.println("FOUND TEMPORARY PASSWORD: " + p);
                return;
            }
        }
        System.out.println("NOT Ulms@XXXX");
    }
}
