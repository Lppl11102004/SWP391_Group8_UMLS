# 📚 TÀI LIỆU API CHO PHÂN HỆ LIBRARIAN (THỦ THƯ) - ULMS

> **Phiên bản:** 1.0.0  
> **Cập nhật ngày:** 18/10/2026  
> **Phân hệ:** Quản lý nghiệp vụ Thủ thư (Librarian Operations)  
> **Base URL:** `http://localhost:8080/ulms/librarian`

---

## 📋 MỤC LỤC

1. [Tổng Quan & Mã Trạng Thái Dữ Liệu](#1-tổng-quan--mã-trạng-thái-dữ-liệu)
2. [Nhóm 1 & 2: Quản Lý Phiếu Mượn & Bàn Giao Sách Tại Quầy](#2-nhóm-1--2-quản-lý-phiếu-mượn--bàn-giao-sách-tại-quầy)
3. [Nhóm 3: Tiếp Nhận Trả Sách & Hoàn Trả Tiền Cọc](#3-nhóm-3-tiếp-nhận-trả-sách--hoàn-trả-tiền-cọc)
4. [Nhóm 4: Quản Lý Tiền Phạt & Quét Trễ Hạn Tự Động](#4-nhóm-4-quản-lý-tiền-phạt--quét-trễ-hạn-tự-động)
5. [Nhóm 5: Quản Lý Danh Sách Hạn Chế (Blacklist)](#5-nhóm-5-quản-lý-danh-sách-hạn-chế-blacklist)
6. [Nhóm 6: Quản Lý Kho Sách, Bản Sao & E-Book](#6-nhóm-6-quản-lý-kho-sách-bản-sao--e-book)
7. [Nhóm 7: Dashboard Số Liệu Tổng Quan](#7-nhóm-7-dashboard-số-liệu-tổng-quan)
8. [Bảng Phân Quyền & Mapping Frontend](#8-bảng-phân-quyền--mapping-frontend)

---

## 1. TỔNG QUAN & MÃ TRẠNG THÁI DỮ LIỆU

### Định dạng Response chuẩn:
```json
{
  "success": true,
  "message": "Thông báo kết quả thao tác",
  "data": { ... }
}
```

### Bảng Matrix trạng thái thực tế:

| Bảng | Trường | Giá trị & Ý nghĩa |
|---|---|---|
| **`reservations`** | `status` | `0`: PENDING (Chờ duyệt)<br>`1`: APPROVED (Đã duyệt, chờ reader đến nhận)<br>`2`: COMPLETED (Đã bàn giao sách)<br>`3`: CANCELED (Độc giả hủy)<br>`4`: REJECTED (Thủ thư từ chối)<br>`5`: EXPIRED (Quá 3 ngày không đến nhận) |
| **`borrow_records`** | `status` | `0`: PENDING (Chờ bàn giao tại quầy)<br>`1`: BORROWING (Đang mượn)<br>`2`: RETURNED (Đã trả xong)<br>`3`: OVERDUE (Quá hạn mượn)<br>`4`: CANCELED (Hủy) |
| | `deposit_status` | `1`: PAID (Đã đóng cọc)<br>`2`: REFUNDED (Đã hoàn cọc)<br>`3`: UNPAID (Chờ nộp cọc) |
| **`borrow_details`** | `status` | `true`: Sách khả dụng đưa vào mượn<br>`false`: Sách đã trả hoặc không khả dụng |
| | `return_status` | `1`: GOOD (Bình thường)<br>`2`: DAMAGED (Hỏng)<br>`3`: LOST (Mất sách) |
| **`book_copies`** | `status` | `1`: AVAILABLE (Khả dụng trên kệ)<br>`2`: RESERVED / BORROWED (Đang giữ hoặc đang cho mượn)<br>`3`: DAMAGED (Hư hại)<br>`4`: LOST (Mất sách) |
| **`fines`** | `status` | `0`: UNPAID (Chưa nộp phạt)<br>`1`: PAID (Đã thanh toán)<br>`2`: WAIVED (Miễn giảm) |
| | `reason` | `1`: OVERDUE (Quá hạn)<br>`2`: DAMAGED (Hư hỏng)<br>`3`: LOST (Mất) |
| **`payments`** | `payment_type` | `1`: FINE (Nộp phạt)<br>`2`: MEMBERSHIP (Phí hội viên)<br>`3`: DEPOSIT (Nộp cọc mượn)<br>`4`: DEPOSIT_REFUND (Hoàn trả tiền cọc) |
| | `payment_method` | `1`: CASH (Tiền mặt tại quầy)<br>`2`: VNPAY (Thanh toán online) |

---

## 2. NHÓM 1 & 2: QUẢN LÝ PHIẾU MƯỢN & BÀN GIAO SÁCH TẠI QUẦY

### 2.1. Danh Sách Phiếu Đặt Giữ Chờ Duyệt (Librarian Reservations)
* **Endpoint:** `GET /ulms/librarian/reservations`
* **Query Params:**
  * `status` (Byte, optional): 0=PENDING, 1=APPROVED, 2=COMPLETED, 3=CANCELED, 4=REJECTED, 5=EXPIRED
  * `keyword` (String, optional): Tìm theo tên, email hoặc số điện thoại độc giả
  * `page` (Integer, default 0)
  * `size` (Integer, default 10)
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu đặt giữ thành công",
  "data": {
    "content": [
      {
        "reservationId": 12,
        "userId": 5,
        "readerName": "Nguyễn Văn A",
        "readerEmail": "nguyenvana@gmail.com",
        "readerPhone": "0987654321",
        "status": 0,
        "totalBooks": 2,
        "availableBooks": 2,
        "note": "Xin mượn gấp trong tuần",
        "createdAt": "2026-10-18T10:00:00",
        "approvedAt": null,
        "expiresAt": null
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 2.2. Chi Tiết Ticket & Trạng Thái Kho Thời Gian Thực
* **Endpoint:** `GET /ulms/librarian/reservations/{reservationId}`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy chi tiết phiếu đặt giữ thành công",
  "data": {
    "reservationId": 12,
    "userId": 5,
    "readerName": "Nguyễn Văn A",
    "readerEmail": "nguyenvana@gmail.com",
    "readerPhone": "0987654321",
    "membershipPlanName": "VIP Member",
    "depositDiscountPct": 50,
    "status": 0,
    "note": "Xin mượn gấp trong tuần",
    "createdAt": "2026-10-18T10:00:00",
    "approvedAt": null,
    "expiresAt": null,
    "borrowRecordId": null,
    "borrowStatus": null,
    "depositStatus": null,
    "depositAmount": null,
    "books": [
      {
        "reservationDetailId": 101,
        "bookId": 1,
        "title": "Clean Code",
        "coverImageUrl": "https://cloudinary.com/cleancode.jpg",
        "authorName": "Robert C. Martin",
        "price": 200000.00,
        "availableCopies": 3,
        "isAvailable": true,
        "assignedBarcode": null
      },
      {
        "reservationDetailId": 102,
        "bookId": 8,
        "title": "Design Patterns",
        "coverImageUrl": "https://cloudinary.com/dp.jpg",
        "authorName": "Gang of Four",
        "price": 300000.00,
        "availableCopies": 0,
        "isAvailable": false,
        "assignedBarcode": null
      }
    ]
  }
}
```

---

### 2.3. Duyệt Phiếu Mượn (Approve Reservation)
* **Endpoint:** `PUT /ulms/librarian/reservations/{reservationId}/approve`
* **Mô tả logic:**
  1. Chuyển `reservation.status = 1` (APPROVED), đặt hạn nhận sách `expiresAt = now + 3 ngày`.
  2. Tạo `BorrowRecord`: `status = 0` (PENDING), `depositStatus = 3` (UNPAID).
  3. Gán `BookCopy` khả dụng vào `BorrowDetail` (`status = true`), chuyển `bookCopy.status = 2` (RESERVED) để chặn đơn khác.
  4. Tính toán tiền cọc: 50% giá bìa mỗi cuốn khả dụng, tự động giảm trừ nếu độc giả có gói hội viên hợp lệ.
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Duyệt phiếu đặt giữ thành công",
  "data": null
}
```

---

### 2.4. Từ Chối Phiếu Mượn (Reject Reservation)
* **Endpoint:** `PUT /ulms/librarian/reservations/{reservationId}/reject`
* **Request Body:**
```json
{
  "note": "Sách yêu cầu hiện đã hết bản sao tại cơ sở"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Từ chối phiếu đặt giữ thành công",
  "data": null
}
```

---

### 2.5. Danh Sách Phiếu Mượn (Borrow Records)
* **Endpoint:** `GET /ulms/librarian/borrow-records`
* **Query Params:**
  * `status` (Byte, optional): 0=PENDING, 1=BORROWING, 2=RETURNED, 3=OVERDUE, 4=CANCELED
  * `depositStatus` (Byte, optional): 1=PAID, 2=REFUNDED, 3=UNPAID
  * `keyword` (String, optional): Tên/email/SĐT độc giả
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu mượn thành công",
  "data": {
    "content": [
      {
        "borrowId": 25,
        "userId": 5,
        "userName": "Nguyễn Văn A",
        "librarianId": 2,
        "librarianName": "Thủ Thư Trưởng",
        "borrowDate": "2026-10-18T10:30:00",
        "dueDate": "2026-11-01T10:30:00",
        "depositAmount": 125000.00,
        "extensionCount": 0,
        "status": 0,
        "depositStatus": 1,
        "note": "Đã đóng cọc, chờ lấy sách",
        "createdAt": "2026-10-18T10:15:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 2.6. Chi Tiết Phiếu Mượn (Borrow Record Detail)
* **Endpoint:** `GET /ulms/librarian/borrow-records/{borrowId}`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy chi tiết phiếu mượn thành công",
  "data": {
    "borrowId": 25,
    "userId": 5,
    "userName": "Nguyễn Văn A",
    "librarianId": 2,
    "librarianName": "Thủ Thư Trưởng",
    "borrowDate": "2026-10-18T10:30:00",
    "dueDate": "2026-11-01T10:30:00",
    "depositAmount": 125000.00,
    "extensionCount": 0,
    "status": 0,
    "depositStatus": 1,
    "note": "Đã duyệt 1/1 cuốn sách",
    "createdAt": "2026-10-18T10:15:00",
    "listBorrowDetail": [
      {
        "detailId": 40,
        "borrowId": 25,
        "copyId": 101,
        "barcode": "BC1_1729243000",
        "bookId": 1,
        "bookTitle": "Clean Code",
        "coverImageUrl": "https://cloudinary.com/cleancode.jpg",
        "authorName": "Robert C. Martin",
        "status": true,
        "returnDate": null,
        "returnStatus": null,
        "note": null
      }
    ]
  }
}
```

---

### 2.7. Bàn Giao Sách Tại Quầy (Confirm Handover)
* **Endpoint:** `PUT /ulms/librarian/borrow-records/{borrowId}/handover`
* **Request Body:**
```json
{
  "note": "Bàn giao sách nguyên vẹn tại quầy 1"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Bàn giao sách cho độc giả thành công",
  "data": null
}
```

---

## 3. NHÓM 3: TIẾP NHẬN TRẢ SÁCH & HOÀN TRẢ TIỀN CỌC

### 3.1. Tiếp Nhận Trả Sách & Hoàn Trả Tiền Cọc Độc Lập
* **Endpoint:** `PUT /ulms/librarian/borrow-records/{borrowId}/return`
* **Mô tả:**
  1. Cập nhật từng cuốn: `returnStatus`: 1=GOOD, 2=DAMAGED, 3=LOST.
  2. Sách tốt: `BookCopy.status = 1` (AVAILABLE) quay lại kho. Sách hỏng/mất: tự động tạo bản ghi `Fine` (status = 0: UNPAID).
  3. Chuyển `borrow_records.status = 2` (RETURNED).
  4. **Hoàn tiền cọc riêng:** Cập nhật `deposit_status = 2` (REFUNDED), tự động tạo bản ghi `Payment` với `payment_type = 4` (DEPOSIT_REFUND), `payment_method = 1` (CASH), `amount = depositAmount`.
* **Request Body:**
```json
{
  "note": "Trả đúng hạn",
  "items": [
    {
      "copyId": 101,
      "returnStatus": 1,
      "fineAmount": null,
      "damageNote": null
    },
    {
      "copyId": 102,
      "returnStatus": 2,
      "fineAmount": 50000.00,
      "damageNote": "Bị rách trang 15-20"
    }
  ]
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tiếp nhận trả sách và hoàn trả tiền cọc thành công",
  "data": null
}
```

---

## 4. NHÓM 4: QUẢN LÝ TIỀN PHẠT & QUÉT TRỄ HẠN TỰ ĐỘNG

### 4.1. Danh Sách Khoản Phạt Toàn Hệ Thống
* **Endpoint:** `GET /ulms/librarian/fines`
* **Query Params:**
  * `userId` (Long, optional)
  * `status` (Byte, optional): 0=UNPAID, 1=PAID, 2=WAIVED
  * `reason` (Byte, optional): 1=OVERDUE, 2=DAMAGED, 3=LOST
  * `keyword` (String, optional)
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách khoản phạt thành công",
  "data": {
    "content": [
      {
        "fineId": 8,
        "borrowRecordId": 25,
        "userId": 5,
        "userName": "Nguyễn Văn A",
        "userEmail": "nguyenvana@gmail.com",
        "userPhone": "0987654321",
        "bookCopyId": 102,
        "bookTitle": "Clean Code",
        "barcode": "BC1_1729243000",
        "amount": 50000.00,
        "reason": 2,
        "status": 0,
        "note": "Bị rách trang 15-20",
        "createdAt": "2026-10-18T11:00:00",
        "updatedAt": "2026-10-18T11:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 4.2. Chi Tiết Khoản Phạt
* **Endpoint:** `GET /ulms/librarian/fines/{fineId}`

---

### 4.3. Tạo Khoản Phạt Thủ Công
* **Endpoint:** `POST /ulms/librarian/fines`
* **Request Body:**
```json
{
  "borrowId": 25,
  "userId": 5,
  "copyId": 102,
  "amount": 50000.00,
  "reason": 2,
  "note": "Bồi thường hỏng bìa sách"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tạo khoản phạt thành công",
  "data": null
}
```

---

### 4.4. Thu Tiền Phạt Bằng Tiền Mặt Tại Quầy
* **Endpoint 1 (Tiền mặt):** `POST /ulms/librarian/fines/{fineId}/pay-cash`
* **Endpoint 2 (Đa phương thức - Tiền mặt / VNPay):** `POST /ulms/librarian/fines/{fineId}/pay?paymentMethod={1|2}`
  * `paymentMethod = 1`: Thu tiền mặt tại quầy (hoàn tất tức thì).
  * `paymentMethod = 2`: Tạo liên kết thanh toán VNPay Sandbox, mở tab mới cho độc giả quét mã QR nộp phạt, sau khi hoàn tất đếm ngược 5 giây tự động quay về trang quản lý phạt `/librarian/fines`.
* **Mô tả:** Cập nhật `fine.status = 1` (PAID), tạo `Payment` mới với `payment_type = 1` (FINE), `payment_method = 1` (CASH), `status = 1` (SUCCESS).
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Ghi nhận thu tiền phạt tại quầy thành công",
  "data": null
}
```

---

### 4.5. Miễn Giảm Khoản Phạt
* **Endpoint:** `PUT /ulms/librarian/fines/{fineId}/waive`
* **Request Body:**
```json
{
  "note": "Miễn giảm theo quyết định của Ban Giám đốc thư viện"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Miễn giảm khoản phạt thành công",
  "data": null
}
```

---

### 4.6. Kích Hoạt Quét Quá Hạn Thủ Công
* **Endpoint:** `POST /ulms/librarian/fines/scan-overdue`
* **Mô tả:** Chạy ngay tiến trình quét quá hạn tương đương lịch biểu định kỳ 01:00 AM mỗi ngày. Tự động tính tiền theo cấu hình `FINE_PER_DAY` trong bảng `settings`.

---

## 5. NHÓM 5: QUẢN LÝ DANH SÁCH HẠN CHẾ (BLACKLIST)

### 5.1. Danh Sách Blacklist
* **Endpoint:** `GET /ulms/librarian/blacklists`
* **Query Params:**
  * `isActive` (Boolean, optional): true (đang khóa), false (đã mở)
  * `keyword` (String, optional)
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách hạn chế thành công",
  "data": {
    "content": [
      {
        "blacklistId": 3,
        "userId": 5,
        "userName": "Nguyễn Văn A",
        "userEmail": "nguyenvana@gmail.com",
        "userPhone": "0987654321",
        "reason": "Làm mất sách nhiều lần chưa bồi hoàn",
        "createdByType": 2,
        "createdByUserId": 2,
        "createdByUserName": "Thủ Thư Trưởng",
        "isActive": true,
        "unlockedAt": null,
        "unlockedByUserId": null,
        "unlockedByUserName": null,
        "createdAt": "2026-10-18T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 5.2. Thêm Độc Giả Vào Blacklist
* **Endpoint:** `POST /ulms/librarian/blacklists`
* **Request Body:**
```json
{
  "userId": 5,
  "reason": "Làm mất sách và không hợp tác nộp phạt tại quầy"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Thêm độc giả vào danh sách hạn chế thành công",
  "data": null
}
```

---

### 5.3. Mở Khóa Độc Giả Khỏi Blacklist
* **Endpoint:** `PUT /ulms/librarian/blacklists/{blacklistId}/unlock`
* **Request Body:**
```json
{
  "note": "Độc giả đã hoàn tất nghĩa vụ bồi hoàn"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Mở khóa độc giả khỏi danh sách hạn chế thành công",
  "data": null
}
```

---

## 6. NHÓM 6: QUẢN LÝ KHO SÁCH, BẢN SAO & E-BOOK

### 6.1. Danh Sách Sách Toàn Diện
* **Endpoint:** `GET /ulms/librarian/books`
* **Query Params:**
  * `keyword`, `categoryId`, `authorId`, `publisherId`
  * `status` (Boolean, optional): true (đang lưu thông), false (đã ẩn)
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách sách thành công",
  "data": {
    "content": [
      {
        "bookId": 1,
        "title": "Clean Code",
        "isbn": "978-0132350884",
        "coverImageUrl": "https://cloudinary.com/cleancode.jpg",
        "price": 200000.00,
        "publishedYear": 2008,
        "authorName": "Robert C. Martin",
        "publisherName": "Prentice Hall",
        "categoryName": "Công nghệ thông tin",
        "status": true,
        "totalCopies": 5,
        "availableCopies": 3,
        "borrowedCopies": 2,
        "hasEBook": true,
        "createdAt": "2026-10-01T08:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 6.2. Thêm Sách Mới
* **Endpoint:** `POST /ulms/librarian/books`
* **Request Body:**
```json
{
  "title": "Microservices Patterns",
  "isbn": "978-1617294549",
  "authorId": 3,
  "publisherId": 1,
  "categoryId": 2,
  "publishedYear": 2018,
  "description": "Sách hướng dẫn kiến trúc Microservices",
  "coverImageUrl": "https://cloudinary.com/microservices.jpg",
  "price": 350000.00,
  "status": true
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Thêm sách mới thành công",
  "data": 15
}
```

---

### 6.3. Cập Nhật Thông Tin Sách
* **Endpoint:** `PUT /ulms/librarian/books/{bookId}`
* **Request Body:** (Tương tự Create, không cho phép đổi ISBN để bảo toàn lịch sử)

---

### 6.4. Danh Sách Bản Sao Vật Lý
* **Endpoint:** `GET /ulms/librarian/books/{bookId}/copies`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách bản sao thành công",
  "data": [
    {
      "copyId": 101,
      "bookId": 1,
      "barcode": "BC1_001",
      "status": 1,
      "createdAt": "2026-10-01T09:00:00",
      "updatedAt": "2026-10-18T10:00:00"
    }
  ]
}
```

---

### 6.5. Thêm Bản Sao Vật Lý
* **Endpoint:** `POST /ulms/librarian/books/{bookId}/copies`
* **Request Body:**
```json
{
  "barcode": "BC1_002"
}
```
*(Nếu để trống `barcode`, hệ thống tự sinh mã duy nhất dạng `BC{bookId}_{timestamp}`)*

---

### 6.6. Cập Nhật Trạng Thái Bản Sao
* **Endpoint:** `PUT /ulms/librarian/copies/{copyId}/status`
* **Request Body:**
```json
{
  "status": 3
}
```
*(Status: 1=AVAILABLE, 2=RESERVED/BORROWED, 3=DAMAGED, 4=LOST)*

---

### 6.7. Upload / Cập Nhật E-Book
* **Endpoint:** `POST /ulms/librarian/books/{bookId}/ebook`
* **Request Body:**
```json
{
  "fileUrl": "https://res.cloudinary.com/demo/image/upload/v1/ebooks/cleancode.pdf",
  "totalPages": 464,
  "fileSizeKb": 15360
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật tài liệu E-Book thành công",
  "data": null
}
```

---

## 7. NHÓM 7: DASHBOARD SỐ LIỆU TỔNG QUAN

### 7.1. Bảng Điều Khiển Số Liệu Thời Gian Thực
* **Endpoint:** `GET /ulms/librarian/dashboard`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Lấy số liệu bảng điều khiển thành công",
  "data": {
    "pendingReservations": 8,
    "activeBorrows": 42,
    "overdueBorrows": 3,
    "unpaidFinesCount": 5,
    "unpaidFineAmount": 350000.00,
    "activeBlacklists": 2,
    "totalBooks": 120,
    "totalCopies": 450,
    "availableCopies": 395
  }
}
```

---

## 8. BẢNG PHÂN QUYỀN & MAPPING FRONTEND

| STT | Endpoint | Method | Vai trò | Màn hình Frontend đề xuất |
|---|---|---|---|---|
| 1 | `/ulms/librarian/dashboard` | `GET` | LIBRARIAN, ADMIN | `LibrarianDashboard.jsx` (Thẻ thống kê số liệu) |
| 2 | `/ulms/librarian/reservations` | `GET` | LIBRARIAN, ADMIN | `ReservationManagement.jsx` (Bảng duyệt ticket) |
| 3 | `/ulms/librarian/reservations/{id}` | `GET` | LIBRARIAN, ADMIN | `ReservationDetailModal.jsx` (Popup duyệt/kiểm kho) |
| 4 | `/ulms/librarian/reservations/{id}/approve` | `PUT` | LIBRARIAN, ADMIN | Nút Duyệt tại Modal chi tiết |
| 5 | `/ulms/librarian/reservations/{id}/reject` | `PUT` | LIBRARIAN, ADMIN | Nút Từ chối tại Modal chi tiết |
| 6 | `/ulms/librarian/borrow-records` | `GET` | LIBRARIAN, ADMIN | `BorrowManagement.jsx` (Quản lý mượn/trả) |
| 7 | `/ulms/librarian/borrow-records/{id}` | `GET` | LIBRARIAN, ADMIN | `BorrowDetailModal.jsx` (Chi tiết phiếu mượn) |
| 8 | `/ulms/librarian/borrow-records/{id}/handover` | `PUT` | LIBRARIAN, ADMIN | Nút "Bàn giao sách" tại quầy |
| 9 | `/ulms/librarian/borrow-records/{id}/return` | `PUT` | LIBRARIAN, ADMIN | `ReturnBookModal.jsx` (Tiếp nhận trả sách & hoàn cọc) |
| 10 | `/ulms/librarian/fines` | `GET` | LIBRARIAN, ADMIN | `FineManagement.jsx` (Quản lý thu phạt) |
| 11 | `/ulms/librarian/fines/{id}/pay-cash` | `POST` | LIBRARIAN, ADMIN | Nút "Thu tiền mặt" tại quầy |
| 12 | `/ulms/librarian/fines/{id}/waive` | `PUT` | LIBRARIAN, ADMIN | Nút "Miễn giảm phạt" |
| 13 | `/ulms/librarian/blacklists` | `GET` | LIBRARIAN, ADMIN | `BlacklistManagement.jsx` (Danh sách hạn chế) |
| 14 | `/ulms/librarian/blacklists` | `POST` | LIBRARIAN, ADMIN | Nút "Thêm vào Blacklist" |
| 15 | `/ulms/librarian/blacklists/{id}/unlock` | `PUT` | LIBRARIAN, ADMIN | Nút "Mở khóa độc giả" |
| 16 | `/ulms/librarian/books` | `GET` | LIBRARIAN, ADMIN | `BookInventory.jsx` (Quản lý kho sách) |
| 17 | `/ulms/librarian/books` | `POST` | LIBRARIAN, ADMIN | `BookCreateModal.jsx` (Thêm sách mới) |
| 18 | `/ulms/librarian/books/{id}` | `PUT` | LIBRARIAN, ADMIN | `BookEditModal.jsx` (Sửa thông tin sách) |
| 19 | `/ulms/librarian/books/{id}/copies` | `GET` | LIBRARIAN, ADMIN | `BookCopiesTab.jsx` (Quản lý bản sao & Barcode) |
| 20 | `/ulms/librarian/books/{id}/copies` | `POST` | LIBRARIAN, ADMIN | Nút "Thêm bản sao" |
| 21 | `/ulms/librarian/copies/{id}/status` | `PUT` | LIBRARIAN, ADMIN | Dropdown đổi trạng thái (Hỏng/Mất/Khả dụng) |
| 22 | `/ulms/librarian/books/{id}/ebook` | `POST` | LIBRARIAN, ADMIN | Nút "Upload / Cập nhật E-Book" |
