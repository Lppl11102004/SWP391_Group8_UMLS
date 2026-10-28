package com.ulms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateLibrarianRequest {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String address;
}
