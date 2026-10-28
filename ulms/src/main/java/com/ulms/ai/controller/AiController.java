package com.ulms.ai.controller;

import com.ulms.ai.dto.AiChatRequest;
import com.ulms.ai.dto.AiChatResponse;
import com.ulms.ai.dto.BookAiSummaryResponse;
import com.ulms.ai.service.AiService;
import com.ulms.exception.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.chat(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xử lý câu hỏi thành công", response));
    }

    @GetMapping("/summary/{bookId}")
    public ResponseEntity<ApiResponse<BookAiSummaryResponse>> getBookSummary(@PathVariable Long bookId) {
        BookAiSummaryResponse response = aiService.summarizeBook(bookId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tóm tắt sách thành công", response));
    }
}
