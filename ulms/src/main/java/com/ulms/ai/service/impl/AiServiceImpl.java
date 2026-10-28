package com.ulms.ai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ulms.ai.dto.*;
import com.ulms.ai.service.AiService;
import com.ulms.book.entity.Book;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent}")
    private String geminiApiUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    // Cache summary to avoid redundant LLM calls
    private final Map<Long, BookAiSummaryResponse> summaryCache = new ConcurrentHashMap<>();

    private static final Pattern BOOK_ID_PATTERN = Pattern.compile("\\[\\[BOOK:(\\d+)\\]\\]");

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        try {
            // 1. Fetch available books in the library
            List<Book> books = bookRepository.findByStatusTrueOrderByCategory_CategoryIdAsc();

            StringBuilder catalogContext = new StringBuilder();
            Map<Long, Book> bookMap = new HashMap<>();

            for (Book b : books) {
                bookMap.put(b.getBookId(), b);
                String catName = b.getCategory() != null ? b.getCategory().getName() : "Khác";
                String authorName = b.getAuthor() != null ? b.getAuthor().getName() : "Không rõ";
                String desc = b.getDescription() != null ? b.getDescription().trim() : "";
                if (desc.length() > 150) {
                    desc = desc.substring(0, 150) + "...";
                }
                catalogContext.append(String.format("- [ID: %d] Tiêu đề: \"%s\" | Tác giả: %s | Thể loại: %s | Tóm tắt: %s\n",
                        b.getBookId(), b.getTitle(), authorName, catName, desc));
            }

            // 2. Build system prompt instructions
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("Bạn là Trợ lý Thư viện thông minh của Hệ thống Thư viện ULMS.\n");
            systemPrompt.append("Nhiệm vụ của bạn:\n");
            systemPrompt.append("1. Tư vấn, định hướng và gợi ý sách phù hợp nhất dựa trên nhu cầu, sở thích, tâm trạng hoặc trình độ của độc giả.\n");
            systemPrompt.append("2. NGUYÊN TẮC BẮT BUỘC: Bạn CHỈ ĐƯỢC PHÉP gợi ý các cuốn sách có trong DANH MỤC THƯ VIỆN dưới đây. Tuyệt đối không tự bịa ra những cuốn sách thư viện không có.\n");
            systemPrompt.append("3. Khi nhắc đến hoặc gợi ý một cuốn sách trong danh mục, BẮT BUỘC phải kèm mã nhận diện [[BOOK:id]] ngay sau tên sách (Ví dụ: \"Đắc Nhân Tâm [[BOOK:3]]\"). Không thay đổi định dạng [[BOOK:id]].\n");
            systemPrompt.append("4. Nếu người dùng hỏi một thể loại hoặc cuốn sách mà thư viện không có, hãy lịch sự thông báo và khéo léo gợi ý các cuốn sách có chủ đề gần nhất hiện có trong thư viện.\n");
            systemPrompt.append("5. Luôn trả lời bằng tiếng Việt thân thiện, nhiệt tình, lịch sự, văn phong chuẩn mực và trình bày bằng Markdown đẹp mắt (gạch đầu dòng, in đậm tên sách).\n");

            if (request.getCurrentBookId() != null && bookMap.containsKey(request.getCurrentBookId())) {
                Book cur = bookMap.get(request.getCurrentBookId());
                systemPrompt.append(String.format("\nLƯU Ý: Người dùng hiện đang xem cuốn sách: \"%s\" (ID: %d, Tác giả: %s, Thể loại: %s). Hãy ưu tiên trả lời hoặc liên hệ với cuốn sách này nếu câu hỏi của họ có liên quan.\n",
                        cur.getTitle(), cur.getBookId(),
                        cur.getAuthor() != null ? cur.getAuthor().getName() : "Không rõ",
                        cur.getCategory() != null ? cur.getCategory().getName() : "Không rõ"));
            }

            systemPrompt.append("\nDANH MỤC SÁCH THỰC TẾ TRONG THƯ VIỆN ULMS:\n");
            systemPrompt.append(catalogContext);

            // 3. Prepare payload for Gemini API
            List<Map<String, Object>> contents = new ArrayList<>();

            // Add previous history with strictly alternating roles starting with "user"
            if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                String expectedRole = "user";
                for (ChatMessage historyMsg : request.getHistory()) {
                    if (historyMsg.getText() == null || historyMsg.getText().isBlank()) continue;
                    String rawRole = "model".equalsIgnoreCase(historyMsg.getRole()) || "assistant".equalsIgnoreCase(historyMsg.getRole())
                            ? "model" : "user";
                    if (contents.isEmpty() && !"user".equals(rawRole)) {
                        continue; // Skip any initial greetings from model
                    }
                    if (rawRole.equals(expectedRole)) {
                        contents.add(Map.of(
                                "role", rawRole,
                                "parts", List.of(Map.of("text", historyMsg.getText().trim()))
                        ));
                        expectedRole = "user".equals(rawRole) ? "model" : "user";
                    }
                }
            }

            // Ensure last message before adding current prompt is not already "user"
            if (!contents.isEmpty() && "user".equals(contents.get(contents.size() - 1).get("role"))) {
                contents.remove(contents.size() - 1);
            }

            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", request.getMessage().trim()))
            ));

            Map<String, Object> requestPayload = Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(Map.of("text", systemPrompt.toString()))
                    ),
                    "contents", contents,
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 2048
                    )
            );

            String responseBody = callGeminiApi(requestPayload);
            String replyText = extractTextFromGeminiResponse(responseBody);

            // 4. Extract recommended books from [[BOOK:id]]
            Set<Long> recommendedIds = new LinkedHashSet<>();
            Matcher matcher = BOOK_ID_PATTERN.matcher(replyText);
            while (matcher.find()) {
                try {
                    recommendedIds.add(Long.parseLong(matcher.group(1)));
                } catch (NumberFormatException ignored) {}
            }

            List<BookSummaryDto> recommendedBooks = recommendedIds.stream()
                    .filter(bookMap::containsKey)
                    .map(id -> {
                        Book b = bookMap.get(id);
                        return BookSummaryDto.builder()
                                .bookId(b.getBookId())
                                .title(b.getTitle())
                                .authorName(b.getAuthor() != null ? b.getAuthor().getName() : "Không rõ")
                                .categoryName(b.getCategory() != null ? b.getCategory().getName() : "Khác")
                                .coverImageUrl(b.getCoverImageUrl())
                                .price(b.getPrice())
                                .shortDescription(b.getDescription())
                                .build();
                    })
                    .collect(Collectors.toList());

            // Format clean reply (replace [[BOOK:id]] with clean link or format)
            String cleanedReply = replyText.replaceAll("\\[\\[BOOK:(\\d+)\\]\\]", "");

            return AiChatResponse.builder()
                    .reply(cleanedReply.trim())
                    .recommendedBooks(recommendedBooks)
                    .build();

        } catch (Exception e) {
            log.error("Error processing AI chat: ", e);
            throw new ApiException("Không thể xử lý yêu cầu AI: " + e.getMessage());
        }
    }

    @Override
    public BookAiSummaryResponse summarizeBook(Long bookId) {
        // Return from cache if already generated
        if (summaryCache.containsKey(bookId)) {
            return summaryCache.get(bookId);
        }

        Book book = bookRepository.findByBookIdAndStatusTrue(bookId)
                .orElseThrow(() -> new ApiException("Không tìm thấy cuốn sách hợp lệ với ID: " + bookId));

        String authorName = book.getAuthor() != null ? book.getAuthor().getName() : "Không rõ tác giả";
        String categoryName = book.getCategory() != null ? book.getCategory().getName() : "Không rõ thể loại";
        String publisherName = book.getPublisher() != null ? book.getPublisher().getName() : "Không rõ NXB";

        String prompt = String.format("""
                Bạn là chuyên gia phân tích và đánh giá sách của Thư viện ULMS.
                Hãy tóm tắt và phân tích giá trị của cuốn sách sau đây:
                - Tên sách: %s
                - Tác giả: %s
                - Thể loại: %s
                - Nhà xuất bản: %s
                - Năm xuất bản: %s
                - Mô tả gốc: %s

                Yêu cầu:
                1. Hãy đóng vai một thủ thư giàu kinh nghiệm để đưa ra nhận xét sâu sắc, súc tích và hấp dẫn.
                2. Phản hồi CHỈ BẰNG một chuỗi JSON hợp lệ (không kèm theo bất kỳ văn bản giải thích hay markdown code block nào) với cấu trúc sau:
                {
                  "summary": "Đoạn tóm tắt tổng quan nội dung và thông điệp chính từ 2-4 câu",
                  "keyPoints": [
                    "Ý chính hoặc bài học rút ra 1",
                    "Ý chính hoặc bài học rút ra 2",
                    "Ý chính hoặc bài học rút ra 3"
                  ],
                  "targetAudience": "Đối tượng độc giả phù hợp nhất (sinh viên, người nghiên cứu, người mới bắt đầu...)",
                  "recommendation": "Lý do vì sao độc giả nên mượn đọc cuốn sách này tại thư viện"
                }
                """,
                book.getTitle(),
                authorName,
                categoryName,
                publisherName,
                book.getPublishedYear() != null ? book.getPublishedYear().toString() : "Chưa cập nhật",
                book.getDescription() != null ? book.getDescription() : "Chưa có mô tả chi tiết."
        );

        try {
            Map<String, Object> requestPayload = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", prompt))
                            )
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.5,
                            "maxOutputTokens", 1500
                    )
            );

            String responseBody = callGeminiApi(requestPayload);
            String rawJson = extractTextFromGeminiResponse(responseBody);

            // Clean code fences if present
            rawJson = cleanJsonString(rawJson);

            JsonNode root = objectMapper.readTree(rawJson);

            String summary = root.path("summary").asText("Không có tóm tắt.");
            String targetAudience = root.path("targetAudience").asText("Độc giả yêu thích thể loại " + categoryName);
            String recommendation = root.path("recommendation").asText("Một cuốn sách đáng đọc tại thư viện.");

            List<String> keyPoints = new ArrayList<>();
            JsonNode keyPointsNode = root.path("keyPoints");
            if (keyPointsNode.isArray()) {
                for (JsonNode kp : keyPointsNode) {
                    keyPoints.add(kp.asText());
                }
            }

            if (keyPoints.isEmpty()) {
                keyPoints.add("Cung cấp kiến thức nền tảng và chuyên sâu về " + categoryName);
                keyPoints.add("Phù hợp cho học tập, nghiên cứu và mở rộng vốn sống");
            }

            BookAiSummaryResponse response = BookAiSummaryResponse.builder()
                    .bookId(book.getBookId())
                    .title(book.getTitle())
                    .authorName(authorName)
                    .summary(summary)
                    .keyPoints(keyPoints)
                    .targetAudience(targetAudience)
                    .recommendation(recommendation)
                    .build();

            summaryCache.put(bookId, response);
            return response;

        } catch (Exception e) {
            log.error("Error generating book summary: ", e);
            // Fallback response if AI parsing encounters issues
            BookAiSummaryResponse fallback = BookAiSummaryResponse.builder()
                    .bookId(book.getBookId())
                    .title(book.getTitle())
                    .authorName(authorName)
                    .summary(book.getDescription() != null && !book.getDescription().isBlank()
                            ? book.getDescription()
                            : "Cuốn sách \"" + book.getTitle() + "\" thuộc thể loại " + categoryName + ", được chắp bút bởi tác giả " + authorName + ".")
                    .keyPoints(List.of(
                            "Thuộc danh mục " + categoryName + " của thư viện",
                            "Tác phẩm đáng chú ý của " + authorName
                    ))
                    .targetAudience("Độc giả quan tâm đến " + categoryName)
                    .recommendation("Hãy mượn đọc ngay tại thư viện ULMS để khám phá trọn vẹn nội dung tác phẩm.")
                    .build();
            return fallback;
        }
    }

    private String callGeminiApi(Map<String, Object> requestPayload) throws Exception {
        String jsonBody = objectMapper.writeValueAsString(requestPayload);

        Set<String> urlsToTry = new LinkedHashSet<>();
        if (geminiApiUrl != null && !geminiApiUrl.isBlank()) {
            urlsToTry.add(geminiApiUrl);
        }
        urlsToTry.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent");
        urlsToTry.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
        urlsToTry.add("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent");

        Exception lastException = null;
        for (String url : urlsToTry) {
            try {
                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json; charset=utf-8")
                        .header("x-goog-api-key", geminiApiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody, java.nio.charset.StandardCharsets.UTF_8))
                        .timeout(Duration.ofSeconds(20))
                        .build();

                HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(java.nio.charset.StandardCharsets.UTF_8));

                if (response.statusCode() == 200) {
                    return response.body();
                }

                log.warn("Gemini API on [{}] returned status {}: {}. Trying next fallback...", url, response.statusCode(), response.body());
                lastException = new RuntimeException("Status " + response.statusCode() + ": " + response.body());
            } catch (Exception e) {
                log.warn("Error calling Gemini API on [{}]: {}. Trying next fallback...", url, e.getMessage());
                lastException = e;
            }
        }

        throw lastException != null ? lastException : new RuntimeException("Tất cả các dịch vụ Gemini API đều không phản hồi.");
    }

    private String extractTextFromGeminiResponse(String responseJson) throws Exception {
        JsonNode root = objectMapper.readTree(responseJson);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                return parts.get(0).path("text").asText("");
            }
        }
        return "Xin lỗi, hiện tại tôi chưa thể đưa ra câu trả lời phù hợp. Bạn vui lòng thử lại nhé!";
    }

    private String cleanJsonString(String raw) {
        String s = raw.trim();
        if (s.startsWith("```json")) {
            s = s.substring(7);
        } else if (s.startsWith("```")) {
            s = s.substring(3);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }
}
