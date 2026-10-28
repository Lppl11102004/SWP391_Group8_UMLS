package com.ulms.util;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadFile(MultipartFile file, String folder);
    String uploadPdf(MultipartFile file, String folder);
}
