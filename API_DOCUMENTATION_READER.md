# TÀI LIỆU TOÀN DIỆN HỆ THỐNG API VÀ HƯỚNG DẪN XÂY DỰNG FRONTEND (REACT JS) - ULMS [PHÂN HỆ GUEST & READER]

> **Dự án:** University Library Management System (ULMS)  
> **Phân hệ:** Độc giả (READER) & Khách vãng lai (GUEST)  
> **Backend Stack:** Spring Boot 3, Spring Security, JWT, SQL Server, VNPay Sandbox, Cloudinary.  
> **Frontend Target:** React JS.

---

## MỤC LỤC

1. [Cấu Hình Chung Cho Postman](#cấu-hình-chung-cho-postman)
2. [I. DANH MỤC API THEO NHÓM & CÁCH TEST POSTMAN](#i-danh-mục-api-theo-nhóm--cách-test-postman)
   - [1. Nhóm Xác Thực & Tài Khoản (Auth)](#1-nhóm-xác-thực--tài-khoản-auth)
   - [2. Nhóm Hồ Sơ Người Dùng (Profile)](#2-nhóm-hồ-sơ-người-dùng-profile)
   - [3. Nhóm Tra Cứu Sách, Danh Mục & Đánh Giá (Books, Categories, Publishers & Reviews)](#3-nhóm-tra-cứu-sách-danh-mục--đánh-giá-books-categories-publishers--reviews)
   - [4. Nhóm Tác Giả (Authors)](#4-nhóm-tác-giả-authors)
   - [5. Nhóm Gói Hội Viên & Quy Định (Membership & Settings)](#5-nhóm-gói-hội-viên--quy-định-membership--settings)
   - [6. Nhóm Giỏ Mượn Sách & Đặt Giữ Chỗ (Borrow Cart & Reservation)](#6-nhóm-giỏ-mượn-sách--đặt-giữ-chỗ-borrow-cart--reservation)
   - [7. Nhóm Đọc Sách Điện Tử (E-Book)](#7-nhóm-đọc-sách-điện-tử-e-book)
   - [8. Nhóm Thông Báo (Notifications)](#8-nhóm-thông-báo-notifications)
   - [9. Nhóm Thanh Toán (Payment Callback)](#9-nhóm-thanh-toán-payment-callback)
   - [10. Nhóm Quản Lý & Nộp Phạt (Fines)](#10-nhóm-quản-lý--nộp-phạt-fines)
   - [11. Nhóm Quản Lý Đánh Giá Cá Nhân (My Reviews)](#11-nhóm-quản-lý-đánh-giá-cá-nhân-my-reviews)
3. [II. BẢNG TỔNG HỢP PHÂN LOẠI QUYỀN TRUY CẬP (GUEST vs READER)](#ii-bảng-tổng-hợp-phân-loại-quyền-truy-cập-guest-vs-reader)
4. [III. MAPPING API VÀO CÁC TRANG GIAO DIỆN REACT JS (FE DESIGN GUIDE)](#iii-mapping-api-vào-các-trang-giao-diện-react-js-fe-design-guide)
5. [IV. ĐÁNH GIÁ CHỨC NĂNG DỰ ÁN MÔN HỌC & CÁC CHỨC NĂNG CẦN BỔ SUNG CHO GUEST & READER](#iv-đánh-giá-chức-năng-dự-án-môn-học--các-chức-năng-cần-bổ-sung-cho-guest--reader)

---

# CẤU HÌNH CHUNG CHO POSTMAN

- **Base URL:** `http://localhost:8080`
- **Port:** `8080`
- **Môi trường Postman (Environment Variables khuyến nghị):**
  - `baseUrl`: `http://localhost:8080`
  - `accessToken`: _(Giá trị Token nhận về từ API Login)_
- **Headers mặc định cho GUEST (Chưa đăng nhập):**
  - `Content-Type: application/json`
- **Headers mặc định cho READER (Đã đăng nhập):**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`

---

# I. DANH MỤC API THEO NHÓM & CÁCH TEST POSTMAN

## 1. Nhóm Xác Thực & Tài Khoản (Auth)

### 1.1. [POST] Đăng ký tài khoản độc giả

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "fullName": "Nguyễn Văn An",
    "email": "reader01@gmail.com",
    "password": "Password123@",
    "phone": "0901234567",
    "address": "Hải Châu, Đà Nẵng"
  }
  ```
- **Response dự kiến (201 Created):**
  ```json
  {
    "success": true,
    "message": "Đăng ký tài khoản thành công. Vui lòng xác thực email",
    "data": null
  }
  ```

---

### 1.2. [POST] Gửi lại mã OTP xác thực email / đặt lại mật khẩu

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/resend-OTP-verify`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "reader01@gmail.com",
    "OTP": "",
    "tokenType": false
  }
  ```
  _(Ghi chú: `tokenType = false` (0): OTP kích hoạt tài khoản; `tokenType = true` (1): OTP đổi/quên mật khẩu)_

---

### 1.3. [POST] Xác thực Email kích hoạt tài khoản

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/verify-email`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "reader01@gmail.com",
    "OTP": "123456",
    "tokenType": false
  }
  ```

---

### 1.4. [POST] Đặt lại mật khẩu (Quên mật khẩu)

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/reset-password`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "reader01@gmail.com",
    "OTP": "123456",
    "tokenType": true,
    "newPassword": "NewPassword123@"
  }
  ```

---

### 1.5. [POST] Đăng nhập hệ thống (Local Account)

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "reader01@gmail.com",
    "password": "Password123@"
  }
  ```
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "tokenType": "Bearer",
      "userId": 1,
      "fullName": "Nguyễn Văn An",
      "phone": "0901234567",
      "avatarUrl": null,
      "address": "Hải Châu, Đà Nẵng",
      "role": "READER",
      "status": 1
    }
  }
  ```
  _(Lấy chuỗi `accessToken` lưu vào biến môi trường Postman `{{accessToken}}`)_

---

### 1.6. [POST] Đăng nhập bằng Google (Google OAuth2 Token)

- **Quyền:** `GUEST`
- **URL:** `{{baseUrl}}/ulms/auth/google`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
  ```

---

### 1.7. [POST] Đăng xuất

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/auth/logout`

---

## 2. Nhóm Hồ Sơ Người Dùng (Profile)

### 2.1. [GET] Xem thông tin cá nhân (Bao gồm trạng thái Blacklist)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/me`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response dự kiến (200 OK):**
  ```json
  {
    "userId": 1,
    "fullName": "Nguyễn Văn An",
    "email": "reader01@gmail.com",
    "phone": "0901234567",
    "avatarUrl": "http://...",
    "address": "Hải Châu, Đà Nẵng",
    "isBlacklisted": false,
    "blacklistReason": null,
    "createdAt": "2026-10-10T02:49:00",
    "lastLoginAt": "2026-10-13T22:00:00"
  }
  ```
  *(Ghi chú: Nếu độc giả đang bị hạn chế, `isBlacklisted = true` và `blacklistReason` sẽ hiển thị chi tiết lý do vi phạm, ví dụ: "Làm hỏng sách giáo trình chưa bồi thường")*

---

### 2.2. [PUT] Cập nhật thông tin cá nhân

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/me`
- **Headers:** `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "userId": 1,
    "fullName": "Nguyễn Văn An Cập Nhật",
    "phone": "0901234568",
    "address": "Ngũ Hành Sơn, Đà Nẵng"
  }
  ```

---

### 2.3. [POST] Đổi mật khẩu

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/me`
- **Headers:** `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "userId": 1,
    "currentPassword": "Password123@",
    "newPassword": "Password456@",
    "confirmPassword": "Password456@"
  }
  ```

---

### 2.4. [POST] Cập nhật ảnh đại diện (Upload Avatar lên Cloudinary)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/me/avatar`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Body:** Dạng `form-data`:
  - `file`: _(Chọn file ảnh định dạng PNG/JPG/JPEG từ máy)_
  - `folder`: `ulms` _(Text, mặc định)_

---

### 2.5. [GET] Tra cứu trạng thái danh sách hạn chế độc lập (My Blacklist Status)

- **Quyền:** `READER` (Chống IDOR: Chỉ tra cứu tài khoản đang đăng nhập)
- **URL:** `{{baseUrl}}/ulms/my-blacklist`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response dự kiến (200 OK) khi tài khoản bình thường:**
  ```json
  {
    "success": true,
    "message": "Tra cứu trạng thái danh sách hạn chế thành công",
    "data": {
      "isBlacklisted": false,
      "reason": "Tài khoản của bạn bình thường, không nằm trong danh sách hạn chế",
      "createdAt": null
    }
  }
  ```
- **Response dự kiến (200 OK) khi tài khoản bị khóa trong Blacklist:**
  ```json
  {
    "success": true,
    "message": "Tra cứu trạng thái danh sách hạn chế thành công",
    "data": {
      "isBlacklisted": true,
      "reason": "Mượn sách quá hạn hơn 30 ngày chưa hoàn trả",
      "createdAt": "2026-10-15T08:30:00"
    }
  }
  ```

---

## 3. Nhóm Tra Cứu Sách, Danh Mục & Đánh Giá (Books, Categories, Publishers & Reviews)

### 3.1. [GET] Lấy danh sách sách trang chủ

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms`
- **Headers:** Không yêu cầu token.
- **Response dự kiến (200 OK):** Danh sách sách nổi bật/mới nhất (`List<BookListResponse>`).

---

### 3.2. [GET] Tìm kiếm & Lọc sách nâng cao

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/search?keyword=Clean&categoryId=1&minPrice=100000&maxPrice=500000&page=0&size=10`
- **Query Params:**
  - `keyword`: Tìm theo tên sách, ISBN, tác giả, nhà xuất bản
  - `categoryId`: Lọc theo mã danh mục
  - `authorId`: Lọc theo tác giả
  - `publisherId`: Lọc theo nhà xuất bản
  - `fromYear`, `toYear`: Năm xuất bản
  - `minPrice`, `maxPrice`: Khoảng giá sách
  - `page`: Trang hiện tại (bắt đầu từ 0)
  - `size`: Số bản ghi mỗi trang (mặc định 10)

---

### 3.3. [GET] Xem chi tiết một cuốn sách

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/books/1`
- **Path Variable:** `id = 1` (bookId)
- **Response dự kiến (200 OK):** Trả về thông tin sách, ảnh bìa, danh sách ảnh phụ, số bản sao khả dụng (`availableCopies`), tình trạng có sách để mượn (`isAvailable`), thông tin ebook, điểm đánh giá trung bình (`averageRating`) và danh sách sách liên quan cùng tác giả.

---

### 3.4. [GET] Xem danh sách đánh giá của sách

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/books/1/reviews?page=0&size=10`
- **Params:** `page=0`, `size=10`

---

### 3.5. [GET] Lấy danh sách thể loại sách (Categories)

- **Quyền:** `GUEST / READER` (Công khai)
- **URL:** `{{baseUrl}}/ulms/categories`
- **Headers:** Không yêu cầu token.
- **Response dự kiến (200 OK):**
  ```json
  [
    {
      "categoryId": 1,
      "name": "Lập trình",
      "description": "Sách về lập trình, ngôn ngữ lập trình và kỹ thuật phát triển phần mềm."
    },
    {
      "categoryId": 2,
      "name": "Công nghệ thông tin",
      "description": "Sách về công nghệ thông tin, máy tính và các công nghệ hiện đại."
    }
  ]
  ```

---

### 3.6. [GET] Lấy danh sách nhà xuất bản (Publishers)

- **Quyền:** `GUEST / READER` (Công khai)
- **URL:** `{{baseUrl}}/ulms/publishers`
- **Headers:** Không yêu cầu token.
- **Response dự kiến (200 OK):**
  ```json
  [
    {
      "publisherId": 1,
      "name": "Nhà Xuất Bản Giáo Dục Việt Nam",
      "address": "81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội"
    },
    {
      "publisherId": 9,
      "name": "Pearson",
      "address": "80 Strand, London, United Kingdom"
    }
  ]
  ```

---

## 4. Nhóm Tác Giả (Authors)

### 4.1. [GET] Danh sách tác giả

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/authors?page=0&size=10`

---

### 4.2. [GET] Chi tiết tác giả & Sách liên quan

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/authors/1`
- **Path Variable:** `id = 1` (authorId)

---

## 5. Nhóm Gói Hội Viên & Quy Định (Membership & Settings)

### 5.1. [GET] Xem danh sách các gói hội viên

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/plans`

---

### 5.2. [POST] Mua mới / Gia hạn / Nâng cấp gói hội viên

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/plans?paymentMethod=2&planId=1&planType=true`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params:**
  - `paymentMethod`: `1` (Tiền mặt tại quầy thư viện), `2` (Thanh toán trực tuyến VNPay Sandbox)
  - `planId`: Mã gói hội viên muốn mua
  - `planType`: `true` (Mua mới / Gia hạn gia tăng thời gian), `false` (Nâng cấp gói - tính cấn trừ ngày thừa)
- **Response:** Với VNPay, trường `data` trả về URL dẫn đến cổng thanh toán VNPay Sandbox.

---

### 5.3. [GET] Xem danh sách quy định thư viện (Settings)

- **Quyền:** `GUEST / READER`
- **URL:** `{{baseUrl}}/ulms/rules`

---

### 5.4. [GET] Xem thông tin gói hội viên hiện tại của tôi (My Membership)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/my-membership`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tải thông tin gói hội viên thành công",
    "data": {
      "userMembershipId": 1,
      "userId": 1,
      "membershipPlansResponse": {
        "planId": 1,
        "name": "STANDARD",
        "price": 50000.0,
        "durationDays": 30,
        "depositDiscountPct": 50,
        "maxDepositAmount": 100000.0,
        "freeDepositPriceLimit": 200000.0,
        "description": "Giảm 50% tiền cọc, đọc E-Book không giới hạn"
      },
      "startAt": "2026-10-10T02:49:00",
      "endAt": "2026-11-09T02:49:00",
      "totalDayRemain": 26,
      "status": 1
    }
  }
  ```

---

## 6. Nhóm Giỏ Mượn Sách & Đặt Giữ Chỗ (Borrow Cart & Reservation)

### 6.1. [POST] Thêm sách vào giỏ mượn

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/add-to-cart`
- **Headers:** `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "userId": 1,
    "bookId": 1
  }
  ```

---

### 6.2. [GET] Xem danh sách giỏ mượn

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/add-to-cart`
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 6.3. [DELETE] Xoá sách khỏi giỏ mượn

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/add-to-cart/1`
- **Path Variable:** `id = 1` (cartId)
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 6.4. [POST] Tạo phiếu yêu cầu đặt mượn sách (Reservation Ticket)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/reservation`
- **Headers:** `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "userId": 1,
    "bookId": [1, 2],
    "note": "Tôi sẽ đến thư viện nhận sách vào sáng mai"
  }
  ```

---

### 6.5. [GET] Lấy danh sách phiếu đặt mượn sách của tôi

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/reservation?status=0&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params:** `status` (Tùy chọn: `0`: Chờ duyệt, `1`: Đã duyệt, `3`: Đã huỷ...), `page`, `size`

---

### 6.6. [GET] Xem chi tiết một phiếu đặt mượn sách

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/reservation/1`
- **Path Variable:** `id = 1` (reservationId)
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 6.7. [PUT] Huỷ phiếu đặt mượn sách

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/reservation/1`
- **Path Variable:** `id = 1` (reservationId)
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 6.8. [GET] Xem danh sách phiếu mượn trả sách thực tế (Borrow Records)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record?status=1&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params:** `status` (Tùy chọn: `0`: Chờ lấy, `1`: Đang mượn, `2`: Đã trả, `3`: Quá hạn, `4`: Đã hủy), `page`, `size`
- **Response dự kiến (200 OK):** Trả về `PageResponse<BorrowRecordListResponse>` với đầy đủ thông tin ngày mượn, ngày đến hạn trả (`dueDate`), tiền cọc, số lần đã gia hạn, trạng thái cọc.

---

### 6.9. [GET] Xem chi tiết một phiếu mượn sách thực tế

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record/1`
- **Path Variable:** `id = 1` (borrowRecordId)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response dự kiến (200 OK):** Trả về `BorrowRecordResponse` chứa danh sách chi tiết từng cuốn sách (`listBorrowDetail`), mã vạch, tên sách (`bookTitle`), ảnh bìa (`coverImageUrl`), tên tác giả (`authorName`), ngày trả thực tế và tình trạng sách khi trả.

---

### 6.10. [PUT] Gia hạn thời gian mượn sách trực tuyến (Extend Borrow Record)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record/1/extend`
- **Path Variable:** `id = 1` (borrowRecordId)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Quy tắc nghiệp vụ kiểm tra chặt chẽ (Fail-Fast):**
  1. **Chính chủ:** Phải là người mượn cuốn sách này (chống IDOR).
  2. **Trạng thái phiếu:** Phải đang ở trạng thái mượn (`status = 1 BORROWING`). Đã trả (`2`) hoặc bị hủy (`4`) không được gia hạn.
  3. **Chưa quá hạn:** `now <= dueDate`. Nếu đã quá hạn (`status = 3 OVERDUE`) thì từ chối, yêu cầu đến quầy nộp phạt.
  4. **Số lần gia hạn:** `extensionCount == 0` (Mỗi phiếu chỉ được gia hạn tối đa **1 lần**).
  5. **Tư cách độc giả:** Không nằm trong `Blacklist` và không có tiền phạt chưa thanh toán (`fines.status == 0 UNPAID`).
- **Kết quả khi duyệt thành công:**
  - Hạn trả mới: `dueDate = dueDate cũ + 7 ngày`.
  - Tăng số lần gia hạn: `extensionCount = 1`.
  - Bắn thông báo xác nhận cho độc giả.
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Gia hạn thành công",
    "data": null
  }
  ```

---

### 6.11. [GET] Lấy danh sách các cuốn sách có thể đánh giá trong phiếu mượn
- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record/1/review`
- **Path Variable:** `id = 1` (borrowRecordId)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Quy tắc nghiệp vụ:**
  - Phiếu mượn phải thuộc về độc giả đang đăng nhập (chống IDOR).
  - Phiếu mượn phải ở trạng thái **ĐÃ TRẢ** (`status == 2 RETURNED`). Nếu chưa hoàn tất trả sách thì chặn không cho đánh giá.
  - Tự động lọc bỏ những cuốn sách mà độc giả **đã từng đánh giá trước đó** (`existsByUserIdAndBookId`), chỉ hiển thị các cuốn sách chưa review.
- **Response dự kiến (200 OK):** Trả về `List<BookListResponse>` các cuốn sách trong phiếu có thể đánh giá.
  ```json
  {
    "success": true,
    "message": "Danh sách bạn có thể đánh giá",
    "data": [
      {
        "bookId": 1,
        "title": "Mắt Biếc",
        "price": 110000.0,
        "coverImageUrl": "https://res.cloudinary.com/.../matbiec.jpg",
        "categoryName": "Văn học",
        "publisherName": "NXB Trẻ"
      }
    ]
  }
  ```

---

### 6.12. [POST] Gửi đánh giá & bình luận cho sách trong phiếu mượn
- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record/1/review`
- **Path Variable:** `id = 1` (borrowRecordId)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Body JSON (Array các đánh giá):**
  ```json
  [
    {
      "bookId": 1,
      "rating": 5,
      "comment": "Sách rất hay, bài học nhân văn sâu sắc!"
    }
  ]
  ```
- **Quy tắc nghiệp vụ & Kiểm duyệt nội dung:**
  - Không được để danh sách rỗng, số sao từ 1 đến 5.
  - Tích hợp bộ lọc từ ngữ thô tục / phản cảm (`checkBadWord`): Nếu phát hiện vi phạm sẽ từ chối lưu và ném thông báo vi phạm quy tắc cộng đồng.
  - Kiểm tra chống trùng lặp `existsByUserIdAndBookId` bảo đảm tính duy nhất.
  - Lưu vào CSDL với trạng thái `status = 1 (ACTIVE)` để hiển thị công khai trên trang chi tiết sách.
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đánh giá thành công",
    "data": null
  }
  ```

---

### 6.13. [POST] Thanh toán tiền đặt cọc mượn sách (Pay Borrow Deposit)
- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/borrow-record/1?paymentMethod=2`
- **Path Variable:** `id = 1` (borrowId)
- **Params:** `paymentMethod` (`1`: Tiền mặt tại quầy - CASH, `2`: Cổng thanh toán trực tuyến - VNPAY)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Quy tắc nghiệp vụ kiểm tra chặt chẽ (Fail-Fast):**
  1. **Chính chủ:** Phiếu mượn phải thuộc về độc giả đang đăng nhập (chống IDOR).
  2. **Trạng thái phiếu mượn:** `borrowRecord.status == 0 (PENDING)` và tiền cọc chưa thanh toán `borrowRecord.depositStatus == 3 (UNPAID)`.
  3. **Đơn đặt giữ sách (`Reservation`):** Phải ở trạng thái đã được thủ thư duyệt `reservation.status == 1 (APPROVED)`, chưa bị quá hạn đến nhận (`expiresAt >= now()`) và thuộc về chính độc giả đó.
  4. **Số tiền cọc:** `depositAmount > 0`.
- **Phân định thẩm quyền rõ ràng giữa Reader và Thủ thư:**
  - **Phía READER:** Khi thanh toán cọc thành công (online VNPay hoặc tiền mặt), hệ thống **CHỈ CẬP NHẬT** `borrowRecord.depositStatus = 1 (PAID)` và gửi thông báo xác nhận.
  - **Trạng thái giữ nguyên:** `reservation.status` (vẫn là 1 APPROVED) và `borrowRecord.status` (vẫn là 0 PENDING).
  - **Bàn giao tại quầy:** Chỉ khi độc giả trực tiếp đến thư viện nhận sách vật lý, Thủ thư mới kiểm tra `deposit_status == 1` và cập nhật `reservation.status = 2 (COMPLETED)`, `borrowRecord.status = 1 (BORROWING)`, ghi nhận `borrowDate = now()`, `dueDate`, `librarian_id` và đổi trạng thái bản sao sách `bookCopy.status = 2 (BORROWED)`.
- **Response dự kiến (200 OK):**
  - Nếu chọn VNPay: Trả về link VNPay trong trường `data` để chuyển hướng.
  - Nếu chọn Tiền mặt: Trả về thông báo *"Ghi nhận thanh toán tiền cọc bằng tiền mặt thành công"*.

---

## 7. Nhóm Đọc Sách Điện Tử (E-Book)

### 7.1. [GET] Lấy thông tin cơ bản E-Book trước khi đọc

- **Quyền:** `READER có gói Membership còn hạn`
- **URL:** `{{baseUrl}}/ulms/books/1/info`
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 7.2. [GET] Stream nội dung nhị phân PDF để hiển thị trên trình đọc

- **Quyền:** `READER có gói Membership còn hạn`
- **URL:** `{{baseUrl}}/ulms/books/1/read`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response:** Dữ liệu nhị phân PDF chuẩn `application/pdf`, hiển thị trực tiếp.

---

### 7.3. [GET] Xem tiến độ đọc sách hiện tại

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/books/1/progress`
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 7.4. [PUT] Cập nhật tiến độ đọc khi lật trang

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/books/1/progress?page=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params:** `page = 10`

---

### 7.5. [GET] Tủ sách cá nhân & "Tiếp tục đọc E-Book" (Continue Reading Shelf)

- **Quyền:** `READER` (Chống IDOR: Chỉ lấy tủ sách của tài khoản đang đăng nhập)
- **URL:** `{{baseUrl}}/ulms/me/reading-shelf`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Mục đích:** Cung cấp dữ liệu tức thì cho Widget "Tiếp tục đọc" trên Dashboard / Màn hình chính. Tự động tính toán tỷ lệ hoàn thành `%` dựa trên số trang đang đọc / tổng số trang, và sắp xếp theo cuốn sách được mở đọc gần nhất (`lastReadAt DESC`).
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tải tủ sách cá nhân thành công",
    "data": [
      {
        "ebookId": 2,
        "bookId": 5,
        "bookTitle": "Kiến Trúc Microservices và Spring Boot",
        "authorName": "Chris Richardson",
        "coverImageUrl": "https://res.cloudinary.com/.../microservices.jpg",
        "currentPage": 45,
        "totalPages": 200,
        "progressPercent": 22.5,
        "lastReadAt": "2026-10-18T03:45:00"
      },
      {
        "ebookId": 1,
        "bookId": 1,
        "bookTitle": "Lập trình Spring Boot căn bản",
        "authorName": "Craig Walls",
        "coverImageUrl": "https://res.cloudinary.com/.../spring-in-action.jpg",
        "currentPage": 180,
        "totalPages": 300,
        "progressPercent": 60.0,
        "lastReadAt": "2026-10-16T14:20:10"
      }
    ]
  }
  ```

---

## 8. Nhóm Thông Báo (Notifications)

### 8.1. [GET] Xem danh sách thông báo

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/notification?isRead=false&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 8.2. [GET] Đánh dấu đã đọc tất cả thông báo

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/notification/mark-all`
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### 8.3. [PATCH / GET] Đánh dấu đã đọc 1 thông báo

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/notification/1` _(hoặc `/ulms/notification/1/read`)_
- **Path Variable:** `id = 1` (notificationId)
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

## 9. Nhóm Thanh Toán (Payment Callback)

### 9.1. [GET] Nhận kết quả thanh toán từ VNPay

- **Quyền:** `GUEST / READER / VNPay Redirect` (Công khai)
- **URL:** `{{baseUrl}}/api/payment/vnpay-callback`
- **Params:** Nhận tự động từ URL mà VNPay redirect về (`vnp_TxnRef`, `vnp_ResponseCode`, `vnp_SecureHash`...).
- **Cơ chế Điều hướng & Hiển thị Frontend (`PaymentCallback.jsx`):**
  - Backend xử lý kiểm tra chữ ký HMAC-SHA512, cập nhật CSDL và redirect về trình duyệt: `http://localhost:3000/payment/callback?txnRef=...&responseCode=00&success=true&paymentType={1|2|3}&message=...`
  - Frontend tự động ẩn toàn bộ thanh Taskbar/Navbar trên, Footer dưới và Chatbot, tạo màn hình tập trung riêng biệt.
  - Đồng hồ đếm ngược 5 giây kèm thanh tiến trình mượt mà, tự động chuyển người dùng về đúng trang trước đó:
    - `paymentType = 1` (Nợ phạt): Quay về `/fines`
    - `paymentType = 2` (Gói hội viên): Quay về `/plans`
    - `paymentType = 3` (Tiền đặt cọc): Quay về `/borrow-records`

---

### 9.2. [POST] Tra cứu & Đồng bộ trạng thái giao dịch VNPay (QueryDR Sync)

- **Quyền:** `Công khai / READER`
- **URL:** `{{baseUrl}}/api/payment/sync/{txnRef}`
- **Path Variable:** `txnRef` (Mã tham chiếu đơn hàng VNPay, ví dụ: `1729000123`)
- **Mục đích:** Xử lý sự cố rớt mạng/mất callback. Khi người dùng đã thanh toán thành công trên VNPay nhưng đơn vẫn ở trạng thái `PENDING`, API này sẽ chủ động kết nối sang VNPay Sandbox (`querydr`) để kiểm tra trạng thái thực tế và tự động hoàn tất dịch vụ (kích hoạt gói hội viên hoặc cập nhật tiền phạt đã nộp).
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đồng bộ giao dịch thành công! Dịch vụ đã được kích hoạt.",
    "data": {
      "success": true,
      "txnRef": "1729000123",
      "message": "Đồng bộ giao dịch thành công! Dịch vụ đã được kích hoạt.",
      "responseCode": "00"
    }
  }
  ```

---

### 9.3. [GET] Xem lịch sử giao dịch & Biên lai tài chính cá nhân (My Payments)
- **Quyền:** `READER` (Chống IDOR: Chỉ tra cứu giao dịch của chính mình)
- **URL:** `{{baseUrl}}/ulms/my-payments?paymentType=3&paymentMethod=2&status=1&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params (Tùy chọn lọc đa tiêu chí):**
  - `paymentType`: `1`: Nộp phạt (FINE), `2`: Gói hội viên (MEMBERSHIP), `3`: Đặt cọc mượn sách (DEPOSIT), `4`: Hoàn trả cọc (DEPOSIT_REFUND); bỏ trống để xem toàn bộ.
  - `paymentMethod`: `1`: Tiền mặt tại quầy (CASH), `2`: Trực tuyến (VNPAY); bỏ trống để xem tất cả.
  - `status`: `0`: Đang chờ xử lý (PENDING), `1`: Thành công (SUCCESS), `2`: Thất bại (FAILED); bỏ trống để xem tất cả.
  - `page`: Trang hiện tại (Mặc định: 0).
  - `size`: Số bản ghi mỗi trang (Mặc định: 10).
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tải lịch sử giao dịch thành công",
    "data": {
      "content": [
        {
          "paymentId": 15,
          "txnRef": "1729067890123",
          "paymentType": 3,
          "paymentMethod": 2,
          "amount": 250000.0,
          "status": 1,
          "bankCode": "NCB",
          "note": "Thanh toán tiền cọc mượn sách",
          "paidAt": "2026-10-16T05:30:00",
          "createdAt": "2026-10-16T05:28:45"
        }
      ],
      "page": 0,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "first": true,
      "last": true
    }
  }
  ```

---

## 10. Nhóm Quản Lý & Nộp Phạt (Fines)

### 10.1. [GET] Xem danh sách tiền phạt cá nhân (My Fines)

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/my-fines?status=0&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params:**
  - `status` (Tùy chọn: `0`: Chưa thanh toán / UNPAID, `1`: Đã thanh toán / PAID, `2`: Được miễn giảm / WAIVED; bỏ trống để xem toàn bộ).
  - `page` (Mặc định: 0), `size` (Mặc định: 10).
- **Response dự kiến (200 OK):** Trả về `PageResponse<FineResponse>` với các trường: `fineId`, `borrowRecordId`, `bookCopyId`, `bookTitles`, `amount`, `reason` (1: Quá hạn, 2: Hỏng sách, 3: Mất sách), `status` (0: UNPAID, 1: PAID, 2: WAIVED), `note`, `createdAt`.

---

### 10.2. [GET] Xem chi tiết một khoản phạt

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/my-fines/1`
- **Path Variable:** `id = 1` (fineId)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Response dự kiến (200 OK):** Trả về chi tiết `FineResponse`.

---

### 10.3. [POST] Thanh toán nợ phạt (CASH tại quầy hoặc VNPAY online)

- **Quyền:** `READER` (Chống IDOR: Chỉ thanh toán khoản phạt của chính mình)
- **URL:** `{{baseUrl}}/ulms/my-fines/1?paymentMethod=2`
- **Path Variable:** `id = 1` (fineId)
- **Params:** `paymentMethod` (`1`: Tiền mặt tại quầy - CASH, `2`: Cổng thanh toán trực tuyến - VNPAY)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Quy tắc nghiệp vụ:**
  - Khoản phạt phải tồn tại và thuộc về độc giả đang đăng nhập.
  - Chặn thanh toán lại nếu `status == 1` (Đã nộp trước đó) hoặc `status == 2` (Đã được miễn giảm).
  - Nếu `paymentMethod == 1` (CASH): Gọi `solveFine`, cập nhật `fine.status = 1`, tạo `Payment`, gửi thông báo.
  - Nếu `paymentMethod == 2` (VNPAY): Khởi tạo giao dịch `initPayment` và trả về link VNPay để chuyển hướng.
- **Response dự kiến (200 OK):**
  - Nếu chọn VNPay: Trả về link VNPay trong trường `data`.
  - Nếu chọn Tiền mặt: Trả về message _"Thanh toán khoản nợ bằng tiền mặt thành công"_.

---

## 11. Nhóm Quản Lý Đánh Giá Cá Nhân (My Reviews)

### 11.1. [GET] Tra cứu danh sách đánh giá của chính mình

- **Quyền:** `READER` (Chống IDOR: Chỉ lấy các đánh giá của độc giả đang đăng nhập)
- **URL:** `{{baseUrl}}/ulms/my-reviews?status=1&page=0&size=10`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Params (Tùy chọn):**
  - `status`: `1`: Đang hiển thị công khai (ACTIVE/VISIBLE), `0`: Đã bị ẩn / Đã xóa mềm (HIDDEN); để trống để xem toàn bộ đánh giá của mình.
  - `page`: Số trang (Mặc định: 0).
  - `size`: Số bản ghi mỗi trang (Mặc định: 10).
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách đánh giá của tôi thành công",
    "data": {
      "content": [
        {
          "reviewId": 3,
          "bookId": 1,
          "bookTitle": "Lập trình Spring Boot căn bản",
          "rating": 5,
          "comment": "Sách viết rất hay, dễ hiểu cho người mới bắt đầu!",
          "status": 1,
          "createdAt": "2026-10-17T09:15:30"
        }
      ],
      "page": 0,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "first": true,
      "last": true
    }
  }
  ```

---

### 11.2. [PUT] Chỉnh sửa đánh giá & nhận xét sách

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/my-reviews/3`
- **Path Variable:** `id = 3` (reviewId cần cập nhật)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Body (raw JSON):**
  ```json
  {
    "bookId": 1,
    "rating": 4,
    "comment": "Nội dung cập nhật: Sách rất chi tiết và hữu ích."
  }
  ```
- **Quy tắc kiểm tra nghiệp vụ nghiêm ngặt (Fail-Fast):**
  1. **Chống IDOR:** Đánh giá phải tồn tại và thuộc quyền sở hữu của chính độc giả đang gửi request (`user.userId == review.userId`).
  2. **Khớp đầu sách:** `bookId` gửi lên phải trùng khớp với cuốn sách được đánh giá ban đầu.
  3. **Giới hạn thời gian sửa đổi (3 ngày):** Hệ thống chỉ cho phép độc giả chỉnh sửa đánh giá trong vòng **3 ngày** tính từ thời điểm tạo (`ChronoUnit.DAYS.between(review.createdAt, now) <= 3`). Nếu vượt quá 3 ngày, hệ thống ném ngoại lệ: *"Điều chỉnh không phù hợp vì vượt quá số ngày quy định (>3 ngày)"*.
  4. **Kiểm duyệt từ ngữ xấu (Content Moderation):** Hệ thống quét nội dung bình luận qua bộ lọc `checkBadWord`. Nếu phát hiện từ ngữ thô tục, xúc phạm hoặc vi phạm tiêu chuẩn cộng đồng, từ chối cập nhật và cảnh báo ngay.
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cập nhật đánh giá thành công",
    "data": null
  }
  ```

---

### 11.3. [DELETE] Xoá mềm đánh giá nhận xét

- **Quyền:** `READER`
- **URL:** `{{baseUrl}}/ulms/my-reviews/3`
- **Path Variable:** `id = 3` (reviewId cần xoá)
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Quy tắc nghiệp vụ & Cơ chế Soft-Delete:**
  - **Chống IDOR:** Chỉ chủ nhân của bài đánh giá mới có quyền xoá.
  - **Không xoá vật lý (Hard-Delete) khỏi DB:** Hệ thống thực hiện xoá mềm bằng cách cập nhật `review.status = 0 (HIDDEN)` và lưu vết. Dữ liệu vẫn được bảo toàn trong CSDL phục vụ đối soát, nhưng bài viết sẽ ngay lập tức biến mất khỏi trang chi tiết sách phía ngoài (`GET /ulms/books/{id}/reviews` chỉ hiển thị các review có `status = 1`).
- **Response dự kiến (200 OK):**
  ```json
  {
    "success": true,
    "message": "Xóa đánh giá thành công",
    "data": null
  }
  ```

---

# II. BẢNG TỔNG HỢP PHÂN LOẠI QUYỀN TRUY CẬP (GUEST vs READER)

| STT | Nhóm Chức Năng    | Tên API                      | Endpoint                       |  Method  |     Phân Quyền     | Điều Kiện & Ghi Chú                              |
| :-: | :---------------- | :--------------------------- | :----------------------------- | :------: | :----------------: | :----------------------------------------------- |
|  1  | Xác thực          | Đăng ký                      | `/ulms/auth/register`          |  `POST`  |     **GUEST**      | Không cần token                                  |
|  2  | Xác thực          | Gửi lại mã OTP               | `/ulms/auth/resend-OTP-verify` |  `POST`  |     **GUEST**      | Không cần token                                  |
|  3  | Xác thực          | Xác thực email               | `/ulms/auth/verify-email`      |  `POST`  |     **GUEST**      | Không cần token                                  |
|  4  | Xác thực          | Đặt lại mật khẩu             | `/ulms/auth/reset-password`    |  `POST`  |     **GUEST**      | Không cần token                                  |
|  5  | Xác thực          | Đăng nhập tài khoản          | `/ulms/auth/login`             |  `POST`  |     **GUEST**      | Không cần token                                  |
|  6  | Xác thực          | Đăng nhập Google             | `/ulms/auth/google`            |  `POST`  |     **GUEST**      | Không cần token                                  |
|  7  | Xác thực          | Đăng xuất                    | `/ulms/auth/logout`            |  `POST`  | **GUEST / READER** | Client xoá token                                 |
|  8  | Tra cứu sách      | Xem danh sách trang chủ      | `/ulms`                        |  `GET`   | **GUEST / READER** | Công khai                                        |
|  9  | Tra cứu sách      | Tìm kiếm & lọc sách          | `/ulms/search`                 |  `GET`   | **GUEST / READER** | Công khai (Query Params)                         |
| 10  | Tra cứu sách      | Xem chi tiết sách            | `/ulms/books/{id}`             |  `GET`   | **GUEST / READER** | Công khai                                        |
| 11  | Tra cứu sách      | Xem đánh giá sách            | `/ulms/books/{id}/reviews`     |  `GET`   | **GUEST / READER** | Công khai                                        |
| 12  | **Thể loại sách** | **Danh sách thể loại**       | `/ulms/categories`             |  `GET`   | **GUEST / READER** | **Công khai (Dùng cho Dropdown FE)**             |
| 13  | **Nhà xuất bản**  | **Danh sách nhà xuất bản**   | `/ulms/publishers`             |  `GET`   | **GUEST / READER** | **Công khai (Dùng cho Dropdown FE)**             |
| 14  | Tác giả           | Danh sách tác giả            | `/ulms/authors`                |  `GET`   | **GUEST / READER** | Công khai                                        |
| 15  | Tác giả           | Chi tiết tác giả             | `/ulms/authors/{id}`           |  `GET`   | **GUEST / READER** | Công khai                                        |
| 16  | Gói hội viên      | Danh sách gói hội viên       | `/ulms/plans`                  |  `GET`   | **GUEST / READER** | Công khai                                        |
| 17  | Gói hội viên      | Xem quy định thư viện        | `/ulms/rules`                  |  `GET`   | **GUEST / READER** | Công khai                                        |
| 18  | Thanh toán        | Nhận kết quả VNPay           | `/api/payment/vnpay-callback`  |  `GET`   | **GUEST / READER** | Công khai (VNPay gọi)                            |
| 19  | Hồ sơ cá nhân     | Xem thông tin cá nhân        | `/ulms/me`                     |  `GET`   |     **READER**     | Cần JWT                                          |
| 20  | Hồ sơ cá nhân     | Cập nhật hồ sơ               | `/ulms/me`                     |  `PUT`   |     **READER**     | Cần JWT                                          |
| 21  | Hồ sơ cá nhân     | Đổi mật khẩu                 | `/ulms/me`                     |  `POST`  |     **READER**     | Cần JWT                                          |
| 22  | Hồ sơ cá nhân     | Cập nhật ảnh đại diện        | `/ulms/me/avatar`              |  `POST`  |     **READER**     | Cần JWT (Multipart)                              |
| 23  | Gói hội viên      | Mua/Gia hạn/Nâng gói         | `/ulms/plans`                  |  `POST`  |     **READER**     | Cần JWT                                          |
| 24  | **Gói hội viên**  | **Xem gói hội viên của tôi** | `/ulms/my-membership`          |  `GET`   |     **READER**     | **Cần JWT (Hạn dùng, ngày còn lại, ưu đãi cọc)** |
| 25  | Giỏ mượn          | Thêm vào giỏ mượn            | `/ulms/add-to-cart`            |  `POST`  |     **READER**     | Cần JWT                                          |
| 26  | Giỏ mượn          | Xem giỏ mượn                 | `/ulms/add-to-cart`            |  `GET`   |     **READER**     | Cần JWT                                          |
| 27  | Giỏ mượn          | Xoá khỏi giỏ mượn            | `/ulms/add-to-cart/{id}`       | `DELETE` |     **READER**     | Cần JWT                                          |
| 28  | Đặt trước sách    | Tạo phiếu mượn (Ticket)      | `/ulms/reservation`            |  `POST`  |     **READER**     | Cần JWT (Tối đa 2 ticket/ngày)                   |
| 29  | Đặt trước sách    | Xem danh sách Ticket         | `/ulms/reservation`            |  `GET`   |     **READER**     | Cần JWT                                          |
| 30  | Đặt trước sách    | Xem chi tiết Ticket          | `/ulms/reservation/{id}`       |  `GET`   |     **READER**     | Cần JWT                                          |
| 31  | Đặt trước sách    | Huỷ Ticket                   | `/ulms/reservation/{id}`       |  `PUT`   |     **READER**     | Cần JWT                                          |
| 32  | **Mượn trả sách** | **Danh sách phiếu mượn trả** | `/ulms/borrow-record`          |  `GET`   |     **READER**     | **Cần JWT (Lịch sử mượn thực tế)**               |
| 33  | **Mượn trả sách** | **Chi tiết phiếu mượn trả**  | `/ulms/borrow-record/{id}`     |  `GET`   |     **READER**     | **Cần JWT (Kèm tên sách, tác giả, ảnh)**         |
| 34  | E-Book            | Lấy thông tin E-Book         | `/ulms/books/{id}/info`        |  `GET`   |     **READER**     | **Cần gói Membership ACTIVE**                    |
| 35  | E-Book            | Stream đọc PDF               | `/ulms/books/{id}/read`        |  `GET`   |     **READER**     | **Cần gói Membership ACTIVE**                    |
| 36  | E-Book            | Lấy tiến độ trang đọc        | `/ulms/books/{id}/progress`    |  `GET`   |     **READER**     | Cần JWT                                          |
| 37  | E-Book            | Lưu trang đang đọc           | `/ulms/books/{id}/progress`    |  `PUT`   |     **READER**     | Cần JWT                                          |
| 38  | Thông báo         | Xem danh sách thông báo      | `/ulms/notification`           |  `GET`   |     **READER**     | Cần JWT                                          |
| 39  | Thông báo         | Đánh dấu đọc tất cả          | `/ulms/notification/mark-all`  |  `GET`   |     **READER**     | Cần JWT                                          |
| 40  | Thông báo         | Đánh dấu đọc 1 thông báo     | `/ulms/notification/{id}`      | `PATCH`  |     **READER**     | Cần JWT                                          |
| 41  | Mượn trả sách     | Tự gia hạn mượn sách online  | `/ulms/borrow-record/{id}/extend` | `PUT` | **READER**         | Cần JWT (Tối đa 1 lần, không nợ phạt, không blacklist) |
| 42  | Mượn trả sách     | Lấy sách có thể đánh giá     | `/ulms/borrow-record/{id}/review` | `GET` | **READER**         | Cần JWT (Chỉ khi phiếu mượn đã hoàn tất trả sách) |
| 43  | Mượn trả sách     | Gửi đánh giá & nhận xét sách | `/ulms/borrow-record/{id}/review` | `POST`| **READER**         | Cần JWT (Kiểm duyệt từ ngữ xấu, 1 review/sách) |
| 44  | Quản lý tiền phạt | Danh sách khoản phạt cá nhân | `/ulms/my-fines`               |  `GET`   | **READER**         | Cần JWT (Lọc theo trạng thái UNPAID/PAID/WAIVED) |
| 45  | Quản lý tiền phạt | Xem chi tiết một khoản phạt  | `/ulms/my-fines/{id}`          |  `GET`   | **READER**         | Cần JWT (Chống IDOR)                             |
| 46  | Quản lý tiền phạt | Thanh toán khoản nợ phạt     | `/ulms/my-fines/{id}`          |  `POST`  | **READER**         | Cần JWT (Thanh toán linh hoạt CASH hoặc VNPAY)   |
| 47  | Thanh toán        | Đồng bộ & Đối soát VNPay     | `/api/payment/sync/{txnRef}`   |  `POST`  | **GUEST / READER** | QueryDR tự động kích hoạt bù khi rớt mạng        |
| 48  | Đặt cọc mượn sách | Nộp tiền cọc phiếu mượn      | `/ulms/borrow-record/{id}`     |  `POST`  | **READER**         | Cần JWT (CASH hoặc VNPAY, chỉ áp dụng PENDING)   |
| 49  | Lịch sử giao dịch | Lịch sử sao kê & Biên lai    | `/ulms/my-payments`            |  `GET`   | **READER**         | Cần JWT (Lọc theo loại, cổng thanh toán, status) |
| 50  | Đánh giá cá nhân  | Danh sách nhận xét của tôi   | `/ulms/my-reviews`             |  `GET`   | **READER**         | Cần JWT (Lọc status hiển thị/ẩn, phân trang)     |
| 51  | Đánh giá cá nhân  | Sửa nội dung đánh giá        | `/ulms/my-reviews/{id}`        |  `PUT`   | **READER**         | Cần JWT (Giới hạn trong vòng 3 ngày kể từ tạo)   |
| 52  | Đánh giá cá nhân  | Xoá mềm đánh giá (Ẩn review) | `/ulms/my-reviews/{id}`        | `DELETE` | **READER**         | Cần JWT (Chuyển status = 0, bảo toàn dữ liệu)    |
| 53  | Hồ sơ cá nhân     | Tra cứu trạng thái Blacklist | `/ulms/my-blacklist`           |  `GET`   | **READER**         | Cần JWT (Minh bạch lý do, thời gian bị phạt)     |
| 54  | E-Book            | Tủ sách cá nhân & Đọc tiếp   | `/ulms/me/reading-shelf`       |  `GET`   | **READER**         | Cần JWT (Tính sẵn %, sắp xếp gần nhất)          |

---

# III. MAPPING API VÀO CÁC TRANG GIAO DIỆN REACT JS (FE DESIGN GUIDE)

Khi xây dựng giao diện bằng **React JS**, bạn nên phân chia thành các Page và Component cụ thể như sau:

```
src/
├── components/
│   ├── Navbar.jsx            (Header chung: Logo, Tìm kiếm nhanh, Giỏ mượn, Chuông thông báo, User Avatar)
│   ├── Footer.jsx
│   ├── BookCard.jsx          (Thẻ hiển thị sách, nút thêm giỏ)
│   └── ProtectedRoute.jsx    (Chặn chuyển hướng nếu chưa đăng nhập vai trò READER)
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   └── ForgotPasswordPage.jsx
│   ├── Home.jsx              (Trang chủ)
│   ├── BookCatalog.jsx       (Trang tìm kiếm & bộ lọc)
│   ├── BookDetail.jsx        (Trang chi tiết sách)
│   ├── EBookReader.jsx       (Trang đọc PDF)
│   ├── Authors.jsx           (Danh sách & chi tiết tác giả)
│   ├── BorrowCart.jsx        (Giỏ mượn sách)
│   ├── MyReservations.jsx    (Danh sách phiếu mượn & chi tiết)
│   ├── BorrowRecords.jsx     (Lịch sử mượn trả & gia hạn sách)
│   ├── MyFines.jsx           (Quản lý & thanh toán tiền phạt)
│   ├── MyPayments.jsx        (Lịch sử giao dịch & biên lai tài chính)
│   ├── MyReviews.jsx         (Quản lý đánh giá của tôi: xem, sửa, xoá mềm)
│   ├── MembershipPlans.jsx   (Bảng so sánh gói & thanh toán)
│   ├── PaymentCallback.jsx   (Nhận kết quả từ VNPay)
│   └── Profile.jsx           (Hồ sơ cá nhân & đổi mật khẩu)
```

### Chi tiết API theo từng trang:

#### 1. Header / Navbar Component (`Navbar.jsx`)

- `GET /ulms/add-to-cart`: Lấy số lượng sách trong giỏ hiển thị huy hiệu (Badge) trên icon Giỏ mượn.
- `GET /ulms/notification?isRead=false`: Hiển thị số lượng thông báo chưa đọc trên chuông thông báo.
- `GET /ulms/notification`: Hiển thị danh sách thông báo dạng Dropdown khi bấm chuông.
- `GET /ulms/notification/mark-all`: Nút "Đánh dấu đã đọc tất cả".
- `PATCH /ulms/notification/{id}`: Khi click vào 1 thông báo cụ thể.
- `POST /ulms/auth/logout`: Xử lý đăng xuất (kèm xóa token trong `localStorage`).

#### 2. Trang Xác Thực (`LoginPage.jsx`, `RegisterPage.jsx`, `VerifyEmailPage.jsx`, `ForgotPasswordPage.jsx`)

- `/login`: Gọi `POST /ulms/auth/login` (nhập form) hoặc `POST /ulms/auth/google` (qua nút Google Login).
- `/register`: Gọi `POST /ulms/auth/register`, sau đó chuyển người dùng sang `/verify-email`.
- `/verify-email`: Gọi `POST /ulms/auth/verify-email` (nhập 6 số OTP) và `POST /ulms/auth/resend-OTP-verify` (nút "Gửi lại OTP").
- `/forgot-password`: Bước 1 gửi OTP (`resend-OTP-verify`), bước 2 xác nhận OTP và nhập mật khẩu mới (`POST /ulms/auth/reset-password`).

#### 3. Trang Chủ (`Home.jsx`)

- `GET /ulms`: Lấy danh sách sách mới nhất / sách nổi bật hiển thị Carousel hoặc Grid.
- `GET /ulms/categories`: Hiển thị danh sách thể loại sách dạng icon / thẻ danh mục nhanh.
- `GET /ulms/plans`: Hiển thị banner/section giới thiệu các gói hội viên để kích thích độc giả đăng ký.
- `GET /ulms/me/reading-shelf`: Hiển thị Widget "Tiếp tục đọc E-Book" cho độc giả đã đăng nhập (Carousel các cuốn sách đọc dở, thanh % tiến độ, bấm nút "Đọc tiếp" để mở thẳng đến trang đang đọc).

#### 4. Trang Danh Mục & Tìm Kiếm Sách (`BookCatalog.jsx`)

- `GET /ulms/categories`: Gọi khi trang load để đổ dữ liệu vào **Dropdown / Danh sách Thể Loại** ở thanh bộ lọc bên trái (Sidebar Filter).
- `GET /ulms/publishers`: Gọi khi trang load để đổ dữ liệu vào **Dropdown / Danh sách Nhà Xuất Bản** ở thanh bộ lọc.
- `GET /ulms/authors`: Đổ dữ liệu vào chọn Tác Giả.
- `GET /ulms/search`: Gửi các bộ lọc đã chọn (thể loại `categoryId`, nhà xuất bản `publisherId`, giá `minPrice`/`maxPrice`, năm xuất bản, từ khoá `keyword`) và phân trang `page`/`size`.
- `POST /ulms/add-to-cart`: Nút icon "Thêm vào giỏ mượn" trên mỗi thẻ sách.

#### 5. Trang Chi Tiết Sách (`BookDetail.jsx`)

- `GET /ulms/books/{id}`: Hiển thị tiêu đề, tác giả, giá, ISBN, số bản sao còn lại (`availableCopies`), nút "Thêm vào giỏ", danh sách sách cùng tác giả.
- `GET /ulms/books/{id}/reviews`: Hiển thị danh sách đánh giá từ các độc giả khác.
- `GET /ulms/books/{id}/info`: Kiểm tra sách có bản E-Book hay không. Nếu có và user có gói hội viên, kích hoạt nút **"Đọc E-Book Ngay"** chuyển đến trang `/books/:id/read`.

#### 6. Trang Trình Đọc E-Book (`EBookReader.jsx`)

- `GET /ulms/books/{id}/info`: Lấy thông tin tổng số trang và trang đã đọc dở gần nhất.
- `GET /ulms/books/{id}/read`: Tải luồng nhị phân PDF và hiển thị bằng thư viện như `react-pdf` hoặc PDF iframe.
- `GET /ulms/books/{id}/progress`: Hiển thị % tiến độ đọc ở thanh header của viewer.
- `PUT /ulms/books/{id}/progress?page={pageNumber}`: Gọi tự động khi độc giả lật trang để lưu tiến độ.

#### 7. Trang Giỏ Mượn Sách (`BorrowCart.jsx`)

- `GET /ulms/add-to-cart`: Bảng danh sách các sách đã chọn để mượn.
- `DELETE /ulms/add-to-cart/{id}`: Nút xoá từng cuốn sách ra khỏi giỏ.
- `POST /ulms/reservation`: Nút **"Tạo phiếu đặt mượn"** (kèm trường nhập ghi chú). Sau khi thành công, chuyển sang trang quản lý phiếu mượn.

#### 8. Trang Quản Lý Phiếu Đặt Chỗ (`MyReservations.jsx`)

- `GET /ulms/reservation`: Hiển thị các tab bộ lọc trạng thái (Chờ duyệt `0`, Đã duyệt `1`, Đã huỷ `3`, Quá hạn `5`).
- `GET /ulms/reservation/{id}`: Modal/Drawer xem chi tiết danh sách các cuốn sách nằm trong Ticket đó.
- `PUT /ulms/reservation/{id}`: Nút "Huỷ yêu cầu" (chỉ hiển thị khi Ticket ở trạng thái `0` hoặc `1`).

#### 9. Trang Lịch Sử Mượn Trả Sách (`BorrowRecords.jsx`)

- `GET /ulms/borrow-record`: Xem danh sách các lần mượn sách thực tế (đang mượn, đã trả, quá hạn).
- `GET /ulms/borrow-record/{id}`: Xem chi tiết phiếu mượn, tên sách, ngày hẹn trả.
- `PUT /ulms/borrow-record/{id}/extend`: Nút "Gia hạn thêm 7 ngày" (chỉ bấm được khi đủ 5 điều kiện).
- `POST /ulms/borrow-record/{id}`: Nộp tiền cọc (bằng tiền mặt hoặc VNPay) cho phiếu mượn.
- `GET /ulms/borrow-record/{id}/review`: Lấy danh sách sách có thể đánh giá sau khi hoàn tất trả sách.
- `POST /ulms/borrow-record/{id}/review`: Modal gửi đánh giá & số sao cho từng cuốn sách.

#### 10. Trang Quản Lý Khoản Phạt Cá Nhân (`MyFines.jsx`)

- `GET /ulms/my-fines`: Bảng danh sách các khoản phạt quá hạn/hỏng/mất sách (lọc theo UNPAID, PAID, WAIVED).
- `GET /ulms/my-fines/{id}`: Xem chi tiết khoản phạt và biên lai.
- `POST /ulms/my-fines/{id}?paymentMethod={1|2}`: Nút "Thanh toán ngay" (chọn CASH tại quầy hoặc VNPAY online).

#### 11. Trang Lịch Sử Giao Dịch & Biên Lai (`MyPayments.jsx`)

- `GET /ulms/my-payments`: Sao kê đầy đủ toàn bộ giao dịch tài chính (Nộp phạt, Mua gói, Tiền cọc, Hoàn cọc).
- `POST /api/payment/sync/{txnRef}`: Nút "Kiểm tra lại giao dịch" (đồng bộ tức thì với VNPay QueryDR nếu gặp sự cố mạng).

#### 12. Trang Quản Lý Đánh Giá Của Tôi (`MyReviews.jsx`)

- `GET /ulms/my-reviews`: Danh sách tất cả các đánh giá và nhận xét mà độc giả đã gửi lên hệ thống.
- `PUT /ulms/my-reviews/{id}`: Nút "Chỉnh sửa" mở modal cho phép sửa số sao và lời bình luận (chỉ hiệu lực trong vòng 3 ngày kể từ ngày đăng).
- `DELETE /ulms/my-reviews/{id}`: Nút "Xóa đánh giá" (thực hiện xóa mềm, ẩn khỏi trang chi tiết sách).

#### 13. Trang Gói Hội Viên & Thanh Toán (`MembershipPlans.jsx`)

- `GET /ulms/plans`: Danh sách các card gói hội viên (Basic, Standard, Premium) kèm chi tiết quyền lợi giảm cọc và đọc sách online.
- `GET /ulms/my-membership`: Thông tin gói hội viên hiện tại, số ngày còn lại và mức ưu đãi cọc.
- `GET /ulms/upgrade-plan`: Danh sách gói nâng cấp kèm số tiền đã cấn trừ ưu đãi.
- `GET /ulms/rules`: Accordion / Popup giải thích quy định mượn sách và tiền cọc.
- `POST /ulms/plans`: Nút "Đăng ký ngay" / "Gia hạn gói" -> Nếu chọn VNPay, nhận URL chuyển hướng `window.location.href = data`.

#### 14. Trang Nhận Kết Quả Thanh Toán VNPay (`PaymentCallback.jsx`)

- Khi VNPay redirect về trình duyệt tại URL `/api/payment/vnpay-callback` hoặc trang FE tương ứng:
- Gọi API `GET /api/payment/vnpay-callback` để kiểm tra chữ ký và cập nhật DB, hiển thị màn hình thông báo _"Chúc mừng bạn đã hoàn tất giao dịch"_ hoặc _"Giao dịch thất bại"_.

#### 15. Trang Hồ Sơ Cá Nhân (`Profile.jsx`)

- `GET /ulms/me`: Hiển thị thông tin cá nhân và **Trạng thái tài khoản (Huy hiệu Xanh: "Bình thường" / Cảnh báo Đỏ: "Bị hạn chế mượn sách" kèm lý do `blacklistReason`)**.
- `GET /ulms/my-blacklist`: Nút "Xem chi tiết vi phạm" mở Modal hiển thị thời gian bị phạt và hướng dẫn mang sách/nợ phạt ra quầy gặp Thủ thư xử lý.
- `PUT /ulms/me`: Form chỉnh sửa Họ tên, Số điện thoại, Địa chỉ.
- `POST /ulms/me`: Form đổi mật khẩu cũ sang mới.
- `POST /ulms/me/avatar`: Input chọn ảnh đại diện, xem trước và bấm lưu.

---

# IV. ĐÁNH GIÁ CHỨC NĂNG DỰ ÁN MÔN HỌC & CÁC CHỨC NĂNG CẦN BỔ SUNG CHO GUEST & READER

So sánh với cơ sở dữ liệu `ULMS.sql` và nghiệp vụ thực tế của một đồ án môn học Quản Lý Thư Viện Đại Học:

### 1. Đối với khách vãng lai (GUEST)

Hệ thống hiện tại đã đáp ứng rất tốt các chức năng cơ bản:

- Đăng ký, đăng nhập local/Google, xác thực OTP email.
- Xem danh sách sách trang chủ, tìm kiếm sách nâng cao.
- **Đã bổ sung:** API `GET /ulms/categories` và `GET /ulms/publishers` giúp FE load dữ liệu động vào thanh bộ lọc mà không cần hardcode.
- Xem danh sách tác giả, chi tiết tác giả, xem giá và quyền lợi các gói hội viên, quy định mượn sách.

👉 **Tính năng nâng cao nên cân nhắc thêm cho GUEST:**

- **Đọc thử (Preview) một vài trang đầu E-Book:** Cho phép GUEST đọc thử 3-5 trang đầu tiên của E-Book để kích thích họ đăng ký tài khoản và mua gói hội viên.

---

### 2. Đối với độc giả đã đăng nhập (READER)

Hệ thống đã có giỏ mượn, tạo phiếu đặt trước (Reservation), thanh toán gói hội viên qua VNPay, đọc E-Book và nhận thông báo:

👉 **Tình trạng các tính năng nâng cao quan trọng:**

1. **Lịch Sử Mượn Trả Sách (`Borrow_Records`) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/borrow-record`: Xem danh sách phiếu mượn trả (lọc theo `status`, phân trang).
   - `GET /ulms/borrow-record/{id}`: Xem chi tiết phiếu mượn kèm ảnh bìa, tác giả, ngày hẹn trả và mã vạch.

2. **Xin Gia Hạn Sách Trực Tuyến - [ĐÃ HOÀN THÀNH]:**
   - `PUT /ulms/borrow-record/{id}/extend`: Cho phép độc giả tự gia hạn thêm 7 ngày trực tiếp trên web với bộ 5 điều kiện kiểm tra nghiêm ngặt (chính chủ, chưa quá hạn, tối đa 1 lần, không Blacklist, không nợ phạt).

3. **Quản Lý Tiền Phạt Cá Nhân (`Fines`) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/my-fines`: Danh sách các khoản tiền phạt cá nhân (quá hạn, hỏng, mất sách).
   - `GET /ulms/my-fines/{id}`: Chi tiết từng khoản phạt.
   - `POST /ulms/my-fines/{id}`: Thanh toán tiền phạt linh hoạt bằng Tiền mặt (CASH) hoặc VNPay trực tuyến.

4. **Cơ Chế Tra Cứu & Đồng Bộ Giao Dịch VNPay (QueryDR Sync) - [ĐÃ HOÀN THÀNH]:**
   - `POST /api/payment/sync/{txnRef}`: Giải quyết triệt để rủi ro rớt mạng/mất callback, chủ động gọi VNPay Sandbox QueryDR để xác nhận và tự động xóa nợ / kích hoạt gói.

5. **Thanh Toán Tiền Cọc Mượn Sách (Deposit Payment) - [ĐÃ HOÀN THÀNH]:**
   - `POST /ulms/borrow-record/{id}`: Nộp tiền cọc bằng Tiền mặt hoặc VNPay khi phiếu ở trạng thái PENDING và đơn đặt giữ đã duyệt.

6. **Lịch Sử Giao Dịch & Biên Lai Tài Chính (My Payments) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/my-payments`: Tra cứu toàn bộ sao kê tài chính cá nhân với bộ lọc đa tiêu chí (loại thanh toán, kênh, trạng thái) an toàn chống IDOR.

7. **Gói Hội Viên Của Tôi (`User_Memberships`) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/my-membership`: Hiển thị gói đang dùng, số ngày còn lại `totalDayRemain`, chi tiết giảm cọc.

8. **Gói Ưu Đãi Nâng Cấp (`Upgrade_Plans`) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/upgrade-plan`: Tự động cấn trừ tiền ngày thừa của gói cũ, hiển thị mức giá ưu đãi khi lên đời gói cao hơn.

9. **API Đánh Giá Sách Sau Khi Trả (`Borrow Record Review`) - [ĐÃ HOÀN THÀNH]:**
   - `GET /ulms/borrow-record/{id}/review`: Lấy danh sách các cuốn sách trong phiếu đã hoàn tất trả để đánh giá.
   - `POST /ulms/borrow-record/{id}/review`: Gửi nhận xét và số sao, tích hợp kiểm duyệt từ ngữ xấu.

10. **Quản Lý Đánh Giá Cá Nhân (`My Reviews`) - [ĐÃ HOÀN THÀNH]:**
    - `GET /ulms/my-reviews`: Tra cứu toàn bộ các bài đánh giá do chính mình viết (kèm lọc status và phân trang).
    - `PUT /ulms/my-reviews/{id}`: Chỉnh sửa lại số sao và bình luận trong vòng 3 ngày kể từ lúc tạo, quét từ cấm tự động.
    - `DELETE /ulms/my-reviews/{id}`: Xoá mềm đánh giá (`status = 0`), bảo toàn tính toàn vẹn dữ liệu trong DB.

11. **Tra Cứu Trạng Thái Danh Sách Hạn Chế (`My Blacklist Status`) - [ĐÃ HOÀN THÀNH]:**
    - `GET /ulms/me`: Bổ sung 2 trường `isBlacklisted` & `blacklistReason` vào thông tin cá nhân.
    - `GET /ulms/my-blacklist`: Endpoint chuyên biệt tra cứu trạng thái hạn chế, hiển thị minh bạch lý do vi phạm và ngày lập biên bản.

12. **Tủ Sách Cá Nhân & "Tiếp Tục Đọc E-Book" (`Continue Reading Shelf`) - [ĐÃ HOÀN THÀNH]:**
    - `GET /ulms/me/reading-shelf`: Tự động tính toán % tiến độ hoàn thành (`currentPage / totalPages * 100%`), kèm ảnh bìa, tác giả và sắp xếp theo cuốn đọc gần nhất (`lastReadAt DESC`) phục vụ hiển thị Widget 1 chạm trên Dashboard.

---

### 3. Kế hoạch tính năng tiếp theo (Roadmap):

1. **Dashboard tổng quan số liệu độc giả (`Reader Dashboard Summary`):**
   - `GET /ulms/me/dashboard-summary`: Gom gọn số sách đang giữ, ticket đang chờ duyệt, số nợ phạt chưa thanh toán và số ngày còn lại của gói hội viên.
2. **Đọc thử E-Book cho khách vãng lai (E-Book Preview):**
   - Cho phép đọc thử 3-5 trang đầu tiên của sách điện tử trước khi mua gói hội viên.
