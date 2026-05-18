package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.response.CategoryResponse;
import com.societyconnect.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryRepository.findAll().stream()
                .map(cat -> new CategoryResponse(cat.getId(), cat.getName(), cat.getIconUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
