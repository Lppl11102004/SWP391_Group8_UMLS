package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorResponse {
    private Integer authorId;
    private String name;
    private String authorAvatarUrl;
    private String avatarUrl;
    private String bio;

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl != null ? authorAvatarUrl : avatarUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl != null ? avatarUrl : authorAvatarUrl;
    }
}
