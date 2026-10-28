package com.ulms.book.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuthorResponse {
    private Integer authorId;
    private String name;
    private String bio;
    private String avatarUrl;
    private String authorAvatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getAvatarUrl() {
        return avatarUrl != null ? avatarUrl : authorAvatarUrl;
    }

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl != null ? authorAvatarUrl : avatarUrl;
    }
}
