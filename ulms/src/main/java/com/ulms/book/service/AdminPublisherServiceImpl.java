package com.ulms.book.service;

import com.ulms.book.dto.AdminPublisherRequest;
import com.ulms.book.dto.AdminPublisherResponse;
import com.ulms.book.entity.Publisher;
import com.ulms.book.repository.BookRepository;
import com.ulms.book.repository.PublisherRepository;
import com.ulms.exception.ApiException;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPublisherServiceImpl implements AdminPublisherService {

    private final PublisherRepository publisherRepository;
    private final BookRepository bookRepository;

    @Override
    public PageResponse<AdminPublisherResponse> searchPublishers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Publisher> pageResult = publisherRepository.searchPublishersForAdmin(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                pageable
        );

        List<AdminPublisherResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    @Override
    public AdminPublisherResponse getPublisherById(Integer publisherId) {
        Publisher publisher = publisherRepository.findById(publisherId)
                .orElseThrow(() -> new ApiException("Không tìm thấy nhà xuất bản với mã: " + publisherId));
        return mapToResponse(publisher);
    }

    @Override
    @Transactional
    public AdminPublisherResponse createPublisher(AdminPublisherRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên nhà xuất bản không được để trống");
        }
        String name = request.getName().trim();
        if (publisherRepository.existsByName(name)) {
            throw new ApiException("Tên nhà xuất bản đã tồn tại trong hệ thống: " + name);
        }

        Publisher publisher = new Publisher();
        publisher.setName(name);
        publisher.setAddress(request.getAddress());
        publisher.setUpdatedAt(LocalDateTime.now());

        Publisher saved = publisherRepository.save(publisher);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminPublisherResponse updatePublisher(Integer publisherId, AdminPublisherRequest request) {
        Publisher publisher = publisherRepository.findById(publisherId)
                .orElseThrow(() -> new ApiException("Không tìm thấy nhà xuất bản với mã: " + publisherId));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên nhà xuất bản không được để trống");
        }
        String name = request.getName().trim();
        if (publisherRepository.existsByNameAndPublisherIdNot(name, publisherId)) {
            throw new ApiException("Tên nhà xuất bản đã được sử dụng bởi NXB khác: " + name);
        }

        publisher.setName(name);
        publisher.setAddress(request.getAddress());
        publisher.setUpdatedAt(LocalDateTime.now());

        Publisher updated = publisherRepository.save(publisher);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePublisher(Integer publisherId) {
        Publisher publisher = publisherRepository.findById(publisherId)
                .orElseThrow(() -> new ApiException("Không tìm thấy nhà xuất bản với mã: " + publisherId));

        if (bookRepository.existsByPublisher_PublisherId(publisherId)) {
            throw new ApiException("Không thể xóa nhà xuất bản đang có sách liên kết trong hệ thống");
        }

        publisherRepository.delete(publisher);
    }

    private AdminPublisherResponse mapToResponse(Publisher p) {
        return AdminPublisherResponse.builder()
                .publisherId(p.getPublisherId())
                .name(p.getName())
                .address(p.getAddress())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
