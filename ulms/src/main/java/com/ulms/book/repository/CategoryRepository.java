package com.ulms.book.repository;

import com.ulms.book.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByName(String name);
    boolean existsByNameAndCategoryIdNot(String name, Integer categoryId);
}
