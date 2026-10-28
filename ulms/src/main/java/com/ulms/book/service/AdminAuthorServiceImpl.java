package com.ulms.book.service;

import com.ulms.book.dto.AdminAuthorRequest;
import com.ulms.book.dto.AdminAuthorResponse;
import com.ulms.book.entity.Author;
import com.ulms.book.repository.AuthorRepository;
import com.ulms.book.repository.BookRepository;
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
public class AdminAuthorServiceImpl implements AdminAuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    @Override
    public PageResponse<AdminAuthorResponse> searchAuthors(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Author> pageResult = authorRepository.searchAuthorsForAdmin(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                pageable
        );

        List<AdminAuthorResponse> content = pageResult.getContent().stream()
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
    public AdminAuthorResponse getAuthorById(Integer authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ApiException("Không tìm thấy tác giả với mã: " + authorId));
        return mapToResponse(author);
    }

    @Override
    @Transactional
    public AdminAuthorResponse createAuthor(AdminAuthorRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên tác giả không được để trống");
        }
        String name = request.getName().trim();
        if (authorRepository.existsByName(name)) {
            throw new ApiException("Tên tác giả đã tồn tại trong hệ thống: " + name);
        }

        Author author = new Author();
        author.setName(name);
        author.setBio(request.getBio());
        author.setAvatarUrl(request.getAvatarUrl());
        author.setCreatedAt(LocalDateTime.now());
        author.setUpdatedAt(LocalDateTime.now());

        Author saved = authorRepository.save(author);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminAuthorResponse updateAuthor(Integer authorId, AdminAuthorRequest request) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ApiException("Không tìm thấy tác giả với mã: " + authorId));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên tác giả không được để trống");
        }
        String name = request.getName().trim();
        if (authorRepository.existsByNameAndAuthorIdNot(name, authorId)) {
            throw new ApiException("Tên tác giả đã được sử dụng bởi tác giả khác: " + name);
        }

        author.setName(name);
        author.setBio(request.getBio());
        if (request.getAvatarUrl() != null) {
            author.setAvatarUrl(request.getAvatarUrl());
        }
        author.setUpdatedAt(LocalDateTime.now());

        Author updated = authorRepository.save(author);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAuthor(Integer authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ApiException("Không tìm thấy tác giả với mã: " + authorId));

        if (bookRepository.existsByAuthor_AuthorId(authorId)) {
            throw new ApiException("Không thể xóa tác giả đang có sách liên kết trong hệ thống");
        }

        authorRepository.delete(author);
    }

    private AdminAuthorResponse mapToResponse(Author a) {
        return AdminAuthorResponse.builder()
                .authorId(a.getAuthorId())
                .name(a.getName())
                .bio(a.getBio())
                .avatarUrl(a.getAvatarUrl())
                .authorAvatarUrl(a.getAvatarUrl())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
