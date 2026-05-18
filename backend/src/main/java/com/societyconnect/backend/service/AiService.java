package com.societyconnect.backend.service;

import com.societyconnect.backend.entity.Category;
import com.societyconnect.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Autowired private CategoryRepository categoryRepository;

    public Map<String, Object> parseIntent(String query) {
        String lowerQuery = query.toLowerCase();
        Map<String, Object> params = new HashMap<>();

        // 1. Detect Category
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            if (lowerQuery.contains(cat.getName().toLowerCase()) || 
                (lowerQuery.contains("clean") && cat.getName().equalsIgnoreCase("Cleaning")) ||
                (lowerQuery.contains("fix") && cat.getName().equalsIgnoreCase("Plumbing"))) {
                params.put("categoryId", cat.getId());
                params.put("categoryName", cat.getName());
                break;
            }
        }

        // 2. Detect Rating Preference
        if (lowerQuery.contains("5 star") || lowerQuery.contains("five star") || lowerQuery.contains("best")) {
            params.put("minRating", 4.5);
        } else if (lowerQuery.contains("4 star") || lowerQuery.contains("good")) {
            params.put("minRating", 4.0);
        }

        // 3. Detect Price Preference
        if (lowerQuery.contains("cheap") || lowerQuery.contains("affordable") || lowerQuery.contains("lowest price")) {
            params.put("sortBy", "price_asc");
        }

        // 4. Fallback keyword search
        if (!params.containsKey("categoryId") && lowerQuery.length() > 3) {
            // strip generic words
            String keyword = lowerQuery.replace("find me", "").replace("a", "").replace("the", "").trim();
            if (!keyword.isEmpty()) {
                params.put("query", keyword);
            }
        }

        return params;
    }
}
