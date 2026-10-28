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
public class AdminCategoryResponse {
    private Integer categoryId;
    private String name;
    private String description;
    private Long bookCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
