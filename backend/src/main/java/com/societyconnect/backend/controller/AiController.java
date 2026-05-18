package com.societyconnect.backend.controller;

import com.societyconnect.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired private AiService aiService;

    @GetMapping("/parse-intent")
    public ResponseEntity<Map<String, Object>> parseIntent(@RequestParam String text) {
        return ResponseEntity.ok(aiService.parseIntent(text));
    }
}
