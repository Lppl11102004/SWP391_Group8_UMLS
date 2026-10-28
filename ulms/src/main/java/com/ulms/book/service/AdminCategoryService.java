package com.ulms.book.service;

import com.ulms.book.dto.AdminCategoryRequest;
import com.ulms.book.dto.AdminCategoryResponse;

import java.util.List;

public interface AdminCategoryService {
    List<AdminCategoryResponse> getAllCategories();
    AdminCategoryResponse getCategoryById(Integer categoryId);
    AdminCategoryResponse createCategory(AdminCategoryRequest request);
    AdminCategoryResponse updateCategory(Integer categoryId, AdminCategoryRequest request);
    void deleteCategory(Integer categoryId);
}
