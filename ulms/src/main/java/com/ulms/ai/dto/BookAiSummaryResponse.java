package com.ulms.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookAiSummaryResponse {
    private Long bookId;
    private String title;
    private String authorName;
    private String summary;
    private List<String> keyPoints;
    private String targetAudience;
    private String recommendation;
}
