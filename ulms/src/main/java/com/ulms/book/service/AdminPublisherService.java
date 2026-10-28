package com.ulms.book.service;

import com.ulms.book.dto.AdminPublisherRequest;
import com.ulms.book.dto.AdminPublisherResponse;
import com.ulms.util.PageResponse;

public interface AdminPublisherService {
    PageResponse<AdminPublisherResponse> searchPublishers(String keyword, int page, int size);
    AdminPublisherResponse getPublisherById(Integer publisherId);
    AdminPublisherResponse createPublisher(AdminPublisherRequest request);
    AdminPublisherResponse updatePublisher(Integer publisherId, AdminPublisherRequest request);
    void deletePublisher(Integer publisherId);
}
