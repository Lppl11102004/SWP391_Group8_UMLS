package com.ulms.util;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public PageResponse(
            List<T> content,
            int page,
            int size,
            long totalElements) {

        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;

        this.totalPages =
                (int) Math.ceil((double) totalElements / size);

        this.first = page == 0;
        this.last = page >= totalPages - 1;
    }
}