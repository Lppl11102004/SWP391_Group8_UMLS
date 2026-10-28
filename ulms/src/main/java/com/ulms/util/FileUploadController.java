package com.ulms.util;

import com.ulms.exception.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ulms/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "ulms/images") String folder
    ) {
        String url = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải ảnh lên Cloudinary thành công", url));
    }

    @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "ulms/ebooks") String folder
    ) {
        String url = cloudinaryService.uploadPdf(file, folder);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải tệp PDF lên Cloudinary thành công", url));
    }
}
