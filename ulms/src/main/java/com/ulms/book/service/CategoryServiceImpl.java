package com.ulms.book.service;

import com.ulms.book.dto.CategoryResponse;
import com.ulms.book.entity.Category;
import com.ulms.book.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService{

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> viewAllCategory() {
        List<CategoryResponse> result = new ArrayList<>();
        List<Category> categories = categoryRepository.findAll();
        for(Category c : categories){
            CategoryResponse categoryResponse = new CategoryResponse();
            categoryResponse.setCategoryId(c.getCategoryId());
            categoryResponse.setName(c.getName());
            categoryResponse.setDescription(c.getDescription());

            result.add(categoryResponse);
        }
        return result;
    }
}
