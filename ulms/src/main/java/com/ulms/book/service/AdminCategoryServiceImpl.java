package com.ulms.book.service;

import com.ulms.book.dto.AdminCategoryRequest;
import com.ulms.book.dto.AdminCategoryResponse;
import com.ulms.book.entity.Category;
import com.ulms.book.repository.BookRepository;
import com.ulms.book.repository.CategoryRepository;
import com.ulms.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    @Override
    public List<AdminCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AdminCategoryResponse getCategoryById(Integer categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thể loại với mã: " + categoryId));
        return mapToResponse(cat);
    }

    @Override
    @Transactional
    public AdminCategoryResponse createCategory(AdminCategoryRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên thể loại không được để trống");
        }
        String name = request.getName().trim();
        if (categoryRepository.existsByName(name)) {
            throw new ApiException("Tên thể loại đã tồn tại: " + name);
        }

        Category cat = new Category();
        cat.setName(name);
        cat.setDescription(request.getDescription());
        cat.setUpdatedAt(LocalDateTime.now());

        Category saved = categoryRepository.save(cat);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminCategoryResponse updateCategory(Integer categoryId, AdminCategoryRequest request) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thể loại với mã: " + categoryId));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên thể loại không được để trống");
        }
        String name = request.getName().trim();
        if (categoryRepository.existsByNameAndCategoryIdNot(name, categoryId)) {
            throw new ApiException("Tên thể loại đã được sử dụng bởi thể loại khác: " + name);
        }

        cat.setName(name);
        cat.setDescription(request.getDescription());
        cat.setUpdatedAt(LocalDateTime.now());

        Category updated = categoryRepository.save(cat);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thể loại với mã: " + categoryId));

        if (bookRepository.existsByCategory_CategoryId(categoryId)) {
            throw new ApiException("Không thể xóa thể loại đang có sách liên kết trong hệ thống");
        }

        categoryRepository.delete(cat);
    }

    private AdminCategoryResponse mapToResponse(Category c) {
        return AdminCategoryResponse.builder()
                .categoryId(c.getCategoryId())
                .name(c.getName())
                .description(c.getDescription())
                .bookCount(0L) // Book count can be queried or left as 0
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
