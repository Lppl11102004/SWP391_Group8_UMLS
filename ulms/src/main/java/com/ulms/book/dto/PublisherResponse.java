package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublisherResponse {
    private Integer publisherId;
    private String name;
    private String address;
}
