package com.ulms.book.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EBookManageRequest {
    private String fileUrl;
    private Integer totalPages;
    private Integer fileSizeKb;
}
