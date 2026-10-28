package com.ulms.ai.service;

import com.ulms.ai.dto.AiChatRequest;
import com.ulms.ai.dto.AiChatResponse;
import com.ulms.ai.dto.BookAiSummaryResponse;

public interface AiService {
    AiChatResponse chat(AiChatRequest request);
    BookAiSummaryResponse summarizeBook(Long bookId);
}
