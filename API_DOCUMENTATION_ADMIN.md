# 🛡️ TÀI LIỆU API CHO PHÂN HỆ ADMIN (QUẢN TRỊ VIÊN) - ULMS

> **Phiên bản:** 1.0.0  
> **Cập nhật ngày:** 18/10/2026  
> **Phân hệ:** Quản trị toàn hệ thống (Admin System Management)  
> **Base URL:** `http://localhost:8080/ulms/admin`  
> **Nguyên tắc kế thừa:** ADMIN có toàn quyền truy cập tất cả API của READER (`/ulms/**`) và LIBRARIAN (`/ulms/librarian/**`), cộng thêm các API quản trị độc quyền dưới đây.

---

## 📑 MỤC LỤC

1. [Tổng Quan & Bảng Mã Trạng Thái Phân Hệ Quản Trị](#1-tổng-quan--bảng-mã-trạng-thái-phân-hệ-quản-trị)
2. [Nhóm 1: Quản Lý Người Dùng & Phân Quyền (User Management)](#2-nhóm-1-quản-lý-người-dùng--phân-quyền-user-management)
3. [Nhóm 2: Quản Lý Cấu Hình Hệ Thống (System Settings)](#3-nhóm-2-quản-lý-cấu-hình-hệ-thống-system-settings)
4. [Nhóm 3: Quản Lý Gói Hội Viên (Membership Plans)](#4-nhóm-3-quản-lý-gói-hội-viên-membership-plans)
5. [Nhóm 4: Quản Lý Danh Mục Sách (Master Data: Category, Author, Publisher)](#5-nhóm-4-quản-lý-danh-mục-sách-master-data)
6. [Nhóm 5: Báo Cáo & Thống Kê Nâng Cao (Reports & Analytics)](#6-nhóm-5-báo-cáo--thống-kê-nâng-cao-reports--analytics)
7. [Nhóm 6: Quản Lý Thông Báo Hàng Loạt (Broadcast Notifications)](#7-nhóm-6-quản-lý-thông-báo-hàng-loạt-broadcast-notifications)
8. [Bảng Phân Quyền & Mapping Frontend](#8-bảng-phân-quyền--mapping-frontend)

---

## 1. TỔNG QUAN & BẢNG MÃ TRẠNG THÁI PHÂN HỆ QUẢN TRỊ

### Định dạng Response chuẩn:
```json
{
  "success": true,
  "message": "Thông báo kết quả thao tác",
  "data": { ... }
}
```

### Bảng Matrix trạng thái thực tế:

| Bảng / Thực thể | Trường | Giá trị & Ý nghĩa |
|---|---|---|
| **`users`** | `status` | `0`: Chờ xác thực OTP / Chưa kích hoạt<br>`1`: Hoạt động bình thường (ACTIVE)<br>`2`: Đã bị khóa tài khoản (LOCKED) |
| | `role_id` | `1`: READER (Bạn đọc)<br>`2`: LIBRARIAN (Thủ thư)<br>`3`: ADMIN (Quản trị viên) |
| **`membership_plans`** | `is_active` | `true`: Đang mở bán cho bạn đọc<br>`false`: Đã ẩn / Tạm ngưng áp dụng |
| **`settings`** | `setting_key` | Khóa cấu hình hệ thống (FINE_PER_DAY, MAX_BORROW_DAYS, DEPOSIT_RATE,...) |
| | `data_type` | Kiểu dữ liệu lưu trữ: `STRING`, `INTEGER`, `DECIMAL`, `BOOLEAN` |
| **`payments`** | `payment_type` | `1`: Phạt (FINE)<br>`2`: Mua gói hội viên (MEMBERSHIP)<br>`3`: Đặt cọc mượn (DEPOSIT)<br>`4`: Hoàn tiền cọc (DEPOSIT_REFUND) |
| | `payment_method` | `1`: Tiền mặt (CASH)<br>`2`: Cổng trực tuyến (VNPAY) |
| | `status` | `0`: PENDING (Chờ thanh toán)<br>`1`: SUCCESS (Thành công)<br>`2`: FAILED (Thất bại) |
| **`notifications`** | `type` | `1`: BORROW_REMINDER<br>`2`: FINE_NOTICE<br>`3`: SYSTEM / BROADCAST (Toàn hệ thống) |

---

## 2. NHÓM 1: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (USER MANAGEMENT)

### 2.1. Tra cứu danh sách Người dùng (Admin User Search)
* **Endpoint:** `GET /ulms/admin/users`
* **Query Params:**
  * `keyword` (String, optional): Tìm theo tên, email, số điện thoại
  * `roleId` (Byte, optional): 1=READER, 2=LIBRARIAN, 3=ADMIN
  * `status` (Byte, optional): 0=PENDING, 1=ACTIVE, 2=LOCKED
  * `page` (Integer, default 0)
  * `size` (Integer, default 10)
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải danh sách người dùng thành công",
  "data": {
    "content": [
      {
        "userId": 5,
        "fullName": "Nguyễn Văn A",
        "email": "reader@example.com",
        "phone": "0901234567",
        "avatarUrl": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
        "roleId": 1,
        "roleName": "READER",
        "status": 1,
        "createdAt": "2024-01-15T10:30:00",
        "lastLoginAt": "2024-10-18T08:15:20"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 150,
    "totalPages": 15,
    "first": true,
    "last": false
  }
}
```

---

### 2.2. Xem Hồ sơ Chi tiết & Bức tranh toàn cảnh Người dùng
* **Endpoint:** `GET /ulms/admin/users/{userId}`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải chi tiết người dùng thành công",
  "data": {
    "userId": 5,
    "fullName": "Nguyễn Văn A",
    "email": "reader@example.com",
    "phone": "0901234567",
    "avatarUrl": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "address": "123 Đường Nguyễn Trãi, Quận 1, TP.HCM",
    "roleId": 1,
    "roleName": "READER",
    "status": 1,
    "createdAt": "2024-01-15T10:30:00",
    "lastLoginAt": "2024-10-18T08:15:20",
    "membershipPlanId": 2,
    "membershipPlanName": "Gói Hội Viên VIP 6 Tháng",
    "membershipStartDate": "2024-08-01T00:00:00",
    "membershipEndDate": "2025-02-01T00:00:00",
    "isMembershipActive": true,
    "activeBorrowCount": 2,
    "unpaidFineAmount": 15000.00,
    "isBlacklisted": false,
    "blacklistReason": null
  }
}
```

---

### 2.3. Tạo Tài khoản Thủ thư (Librarian Provisioning)
* **Endpoint:** `POST /ulms/admin/users/librarian`
* **Request Body:**
```json
{
  "fullName": "Thủ Thư Trần Thị Mai",
  "email": "librarian.mai@library.vn",
  "password": "Password@123",
  "phone": "0987654321",
  "address": "Phòng Nghiệp Vụ Thư Viện, Tầng 2"
}
```
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tạo tài khoản thủ thư thành công",
  "data": {
    "userId": 12,
    "fullName": "Thủ Thư Trần Thị Mai",
    "email": "librarian.mai@library.vn",
    "phone": "0987654321",
    "avatarUrl": null,
    "roleId": 2,
    "roleName": "LIBRARIAN",
    "status": 1,
    "createdAt": "2024-10-18T17:00:00",
    "lastLoginAt": null
  }
}
```

---

### 2.4. Khóa / Mở khóa Tài khoản Người dùng
* **Endpoint:** `PATCH /ulms/admin/users/{userId}/status`
* **Request Body:**
```json
{
  "status": 2,
  "reason": "Vi phạm quy định nhiều lần không hoàn trả sách"
}
```
* **Lưu ý nghiệp vụ:**
  * Không thể khóa tài khoản của chính Admin đang đăng nhập.
  * Không thể khóa tài khoản của các Admin khác.
  * Nếu khóa (`status = 2`), hệ thống tự động phát sinh thông báo đẩy vào hòm thư bạn đọc.

---

### 2.5. Thay đổi Vai trò Người dùng (Role Delegation)
* **Endpoint:** `PATCH /ulms/admin/users/{userId}/role`
* **Request Body:**
```json
{
  "roleId": 2
}
```
* **Lưu ý nghiệp vụ:** Chỉ cho phép chuyển đổi giữa `1` (READER) và `2` (LIBRARIAN). Không cho phép gán quyền Admin qua API này.

---

### 2.6. Đặt lại Mật khẩu tạm thời cho Người dùng (Password Reset)
* **Endpoint:** `POST /ulms/admin/users/{userId}/reset-password`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu người dùng thành công",
  "data": {
    "userId": 5,
    "email": "reader@example.com",
    "temporaryPassword": "Ulms@8492"
  }
}
```

---

## 3. NHÓM 2: QUẢN LÝ CẤU HÌNH HỆ THỐNG (SYSTEM SETTINGS)

### 3.1. Danh sách Cấu hình Hệ thống
* **Endpoint:** `GET /ulms/admin/settings`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải danh sách cấu hình hệ thống thành công",
  "data": [
    {
      "settingId": 1,
      "settingKey": "FINE_PER_DAY",
      "settingValue": "5000",
      "dataType": "INTEGER",
      "description": "Phí phạt trễ hạn trả sách mỗi ngày (VNĐ)",
      "updatedAt": "2024-10-18T10:00:00"
    },
    {
      "settingId": 5,
      "settingKey": "MAX_BORROW_BOOKS",
      "settingValue": "5",
      "dataType": "INTEGER",
      "description": "Số lượng sách tối đa được mượn cùng một thời điểm",
      "updatedAt": "2024-10-18T10:00:00"
    }
  ]
}
```

---

### 3.2. Xem Chi tiết Cấu hình theo ID
* **Endpoint:** `GET /ulms/admin/settings/{settingId}`

---

### 3.3. Tạo Cấu hình Mới
* **Endpoint:** `POST /ulms/admin/settings`
* **Request Body:**
```json
{
  "settingKey": "MAX_RENEWAL_DAYS",
  "settingValue": "7",
  "dataType": "INTEGER",
  "description": "Số ngày được gia hạn thêm tối đa mỗi lần"
}
```

---

### 3.4. Cập nhật Giá trị Cấu hình
* **Endpoint:** `PUT /ulms/admin/settings/{settingId}`
* **Request Body:**
```json
{
  "settingValue": "7000",
  "description": "Điều chỉnh phí phạt quá hạn lên 7.000 VNĐ/ngày"
}
```

---

## 4. NHÓM 3: QUẢN LÝ GÓI HỘI VIÊN (MEMBERSHIP PLANS)

### 4.1. Danh sách Gói Hội viên (Toàn diện kèm số liệu bán)
* **Endpoint:** `GET /ulms/admin/membership-plans`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải danh sách gói hội viên thành công",
  "data": [
    {
      "planId": 1,
      "name": "Gói Tháng Cơ Bản",
      "price": 50000.00,
      "durationDays": 30,
      "depositDiscountPct": 10,
      "maxDepositAmount": 500000.00,
      "freeDepositPriceLimit": 100000.00,
      "description": "Gói tiết kiệm, giảm 10% tiền cọc sách",
      "isActive": true,
      "activeUserCount": 42,
      "totalRevenue": 2100000.00,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-10-18T15:00:00"
    }
  ]
}
```

---

### 4.2. Xem Chi tiết Gói Hội viên
* **Endpoint:** `GET /ulms/admin/membership-plans/{planId}`

---

### 4.3. Tạo Gói Hội viên Mới
* **Endpoint:** `POST /ulms/admin/membership-plans`
* **Request Body:**
```json
{
  "name": "Gói Năm Thượng Hạng VIP",
  "price": 500000.00,
  "durationDays": 365,
  "depositDiscountPct": 30,
  "maxDepositAmount": 2000000.00,
  "freeDepositPriceLimit": 200000.00,
  "description": "Gói năm cao cấp nhất, miễn cọc sách dưới 200k và giảm 30% cọc sách lớn",
  "isActive": true
}
```

---

### 4.4. Cập nhật Gói Hội viên
* **Endpoint:** `PUT /ulms/admin/membership-plans/{planId}`
* **Request Body:** Tương tự như tạo mới

---

### 4.5. Bật / Tắt trạng thái Kinh doanh Gói Hội viên (Toggle Active)
* **Endpoint:** `PATCH /ulms/admin/membership-plans/{planId}/toggle-active`
* **Mô tả:** Đổi nhanh trạng thái `isActive` giữa `true` và `false`. Khi ẩn, bạn đọc sẽ không thấy gói này trên kệ mua hội viên.

---

## 5. NHÓM 4: QUẢN LÝ DANH MỤC SÁCH (MASTER DATA)

### 5.1. Quản lý Thể loại Sách (Categories)
* `GET /ulms/admin/categories` — Lấy danh sách thể loại
* `GET /ulms/admin/categories/{categoryId}` — Lấy chi tiết thể loại
* `POST /ulms/admin/categories` — Tạo thể loại mới
* `PUT /ulms/admin/categories/{categoryId}` — Sửa tên, mô tả thể loại
* `DELETE /ulms/admin/categories/{categoryId}` — Xóa thể loại (Chặn nếu đang có sách liên kết)

**Request Mẫu:**
```json
{
  "name": "Khoa Học & Trí Tuệ Nhân Tạo",
  "description": "Các đầu sách về công nghệ máy học, AI và tương lai tri thức"
}
```

---

### 5.2. Quản lý Tác giả (Authors)
* `GET /ulms/admin/authors?keyword=&page=0&size=10` — Tìm kiếm tác giả phân trang
* `GET /ulms/admin/authors/{authorId}` — Chi tiết tác giả
* `POST /ulms/admin/authors` — Thêm mới tác giả
* `PUT /ulms/admin/authors/{authorId}` — Cập nhật thông tin tác giả
* `DELETE /ulms/admin/authors/{authorId}` — Xóa tác giả (Chặn nếu đang có sách liên kết)

**Request Mẫu:**
```json
{
  "name": "Nguyễn Nhật Ánh",
  "bio": "Nhà văn hiện đại được đông đảo bạn đọc thiếu nhi và thanh thiếu niên mến mộ",
  "avatarUrl": "https://res.cloudinary.com/demo/image/upload/nna.jpg"
}
```

---

### 5.3. Quản lý Nhà xuất bản (Publishers)
* `GET /ulms/admin/publishers?keyword=&page=0&size=10` — Tìm kiếm nhà xuất bản
* `GET /ulms/admin/publishers/{publisherId}` — Chi tiết nhà xuất bản
* `POST /ulms/admin/publishers` — Thêm mới nhà xuất bản
* `PUT /ulms/admin/publishers/{publisherId}` — Cập nhật nhà xuất bản
* `DELETE /ulms/admin/publishers/{publisherId}` — Xóa nhà xuất bản (Chặn nếu có sách liên kết)

**Request Mẫu:**
```json
{
  "name": "Nhà Xuất Bản Trẻ",
  "address": "161B Lý Chính Thắng, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh"
}
```

---

## 6. NHÓM 5: BÁO CÁO & THỐNG KÊ NÂNG CAO (REPORTS & ANALYTICS)

### 6.1. Bảng điều khiển Quản trị Cấp cao (Admin Executive Dashboard)
* **Endpoint:** `GET /ulms/admin/dashboard`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải dữ liệu bảng điều khiển quản trị thành công",
  "data": {
    "totalUsers": 1250,
    "newUsersThisMonth": 68,
    "activeLibrarians": 6,
    "activeMembers": 215,
    "blacklistedUsers": 3,
    "totalBooks": 3400,
    "totalBookCopies": 8900,
    "activeBorrows": 180,
    "overdueCount": 14,
    "pendingReservations": 8,
    "totalRevenueThisMonth": 6500000.00,
    "fineRevenueThisMonth": 1200000.00,
    "membershipRevenueThisMonth": 5300000.00
  }
}
```

---

### 6.2. Sổ cái Giao dịch Toàn hệ thống (Universal Payment Ledger)
* **Endpoint:** `GET /ulms/admin/reports/payments`
* **Query Params:**
  * `userId` (Long, optional): Lọc theo ID người dùng
  * `paymentType` (Byte, optional): 1=FINE, 2=MEMBERSHIP, 3=DEPOSIT, 4=DEPOSIT_REFUND
  * `paymentMethod` (Byte, optional): 1=CASH, 2=VNPAY
  * `status` (Byte, optional): 0=PENDING, 1=SUCCESS, 2=FAILED
  * `fromDate`, `toDate` (ISO DateTime, optional)
  * `keyword` (String, optional): Mã giao dịch txnRef, email hoặc tên bạn đọc
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải báo cáo thanh toán thành công",
  "data": {
    "content": [
      {
        "paymentId": 305,
        "userId": 5,
        "userFullName": "Nguyễn Văn A",
        "userEmail": "reader@example.com",
        "paymentType": 2,
        "borrowRecordId": null,
        "fineId": null,
        "membershipPlanId": 2,
        "membershipPlanName": "Gói Hội Viên VIP 6 Tháng",
        "amount": 250000.00,
        "paymentMethod": 2,
        "txnRef": "VN_PAY_172926712345",
        "gatewayTxnNo": "14829304",
        "status": 1,
        "note": "Thanh toán gói hội viên qua VNPay",
        "paidAt": "2024-10-18T10:15:30",
        "createdAt": "2024-10-18T10:12:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 450,
    "totalPages": 45
  }
}
```

---

### 6.3. Báo cáo Top Đầu Sách Được Mượn Nhiều Nhất
* **Endpoint:** `GET /ulms/admin/reports/top-books`
* **Query Params:**
  * `fromDate`, `toDate` (ISO DateTime, optional)
  * `limit` (Integer, default 10)
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải danh sách sách được mượn nhiều nhất thành công",
  "data": [
    {
      "bookId": 101,
      "title": "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      "isbn": "9786041012345",
      "authorName": "Nguyễn Nhật Ánh",
      "categoryName": "Văn học thiếu nhi",
      "borrowCount": 142
    },
    {
      "bookId": 105,
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "isbn": "9780132350884",
      "authorName": "Robert C. Martin",
      "categoryName": "Công nghệ thông tin",
      "borrowCount": 98
    }
  ]
}
```

---

### 6.4. Báo cáo Tổng thể Tình hình Hội viên
* **Endpoint:** `GET /ulms/admin/reports/memberships`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải báo cáo hội viên thành công",
  "data": {
    "totalActiveMemberships": 215,
    "newMembershipsThisMonth": 38,
    "expiringSoon": 12,
    "revenueByPlan": [
      {
        "planId": 1,
        "planName": "Gói Tháng Cơ Bản",
        "activeUserCount": 85,
        "soldCount": 140,
        "totalRevenue": 7000000.00
      },
      {
        "planId": 2,
        "planName": "Gói VIP 6 Tháng",
        "activeUserCount": 130,
        "soldCount": 160,
        "totalRevenue": 40000000.00
      }
    ]
  }
}
```

---

## 7. NHÓM 6: QUẢN LÝ THÔNG BÁO HÀNG LOẠT (BROADCAST NOTIFICATIONS)

### 7.1. Gửi Thông Báo Hàng Loạt (Push Broadcast)
* **Endpoint:** `POST /ulms/admin/notifications/broadcast`
* **Request Body:**
```json
{
  "targetGroup": "ALL",
  "title": "Thông báo: Thư viện bảo trì hệ thống và nghỉ lễ 30/4",
  "type": 3
}
```
* **Tham số `targetGroup`:**
  * `"ALL"`: Gửi đến tất cả người dùng trong hệ thống
  * `"READER"`: Chỉ gửi đến bạn đọc
  * `"LIBRARIAN"`: Chỉ gửi đến đội ngũ thủ thư
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Gửi thông báo hàng loạt thành công đến 1250 người dùng",
  "data": {
    "sentCount": 1250,
    "targetGroup": "ALL",
    "title": "Thông báo: Thư viện bảo trì hệ thống và nghỉ lễ 30/4",
    "sentAt": "2024-10-18T17:15:00"
  }
}
```

---

### 7.2. Tra cứu Lịch sử Thông báo Đã Phát
* **Endpoint:** `GET /ulms/admin/notifications/history`
* **Query Params:**
  * `type` (Byte, optional): 3=SYSTEM, 1=BORROW_REMINDER, 2=FINE_NOTICE
  * `keyword` (String, optional): Tìm theo tiêu đề, tên hoặc email người nhận
  * `page`, `size`
* **Response Mẫu (200 OK):**
```json
{
  "success": true,
  "message": "Tải lịch sử thông báo thành công",
  "data": {
    "content": [
      {
        "notificationId": 9812,
        "userId": 5,
        "userFullName": "Nguyễn Văn A",
        "userEmail": "reader@example.com",
        "title": "Thông báo: Thư viện bảo trì hệ thống và nghỉ lễ 30/4",
        "type": 3,
        "isRead": false,
        "readAt": null,
        "createdAt": "2024-10-18T17:15:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1250,
    "totalPages": 125
  }
}
```

---

## 8. BẢNG PHÂN QUYỀN & MAPPING FRONTEND

| Mục Quản Trị | Đường Dẫn Frontend Gợi Ý | Danh Sách Endpoint Backend Phục Vụ |
|---|---|---|
| **Bảng điều khiển Tổng** | `/admin/dashboard` | `GET /ulms/admin/dashboard`<br>`GET /ulms/admin/reports/top-books` |
| **Quản lý Tài khoản** | `/admin/users` | `GET /ulms/admin/users`<br>`GET /ulms/admin/users/{id}`<br>`POST /ulms/admin/users/librarian`<br>`PATCH /ulms/admin/users/{id}/status`<br>`PATCH /ulms/admin/users/{id}/role`<br>`POST /ulms/admin/users/{id}/reset-password` |
| **Cấu hình Hệ thống** | `/admin/settings` | `GET /ulms/admin/settings`<br>`GET /ulms/admin/settings/{id}`<br>`POST /ulms/admin/settings`<br>`PUT /ulms/admin/settings/{id}` |
| **Gói Hội viên** | `/admin/memberships` | `GET /ulms/admin/membership-plans`<br>`GET /ulms/admin/membership-plans/{id}`<br>`POST /ulms/admin/membership-plans`<br>`PUT /ulms/admin/membership-plans/{id}`<br>`PATCH /ulms/admin/membership-plans/{id}/toggle-active` |
| **Danh mục Thể loại** | `/admin/master-data/categories` | `CRUD /ulms/admin/categories/**` |
| **Danh mục Tác giả** | `/admin/master-data/authors` | `CRUD /ulms/admin/authors/**` |
| **Danh mục Nhà XB** | `/admin/master-data/publishers` | `CRUD /ulms/admin/publishers/**` |
| **Sổ cái Thanh toán** | `/admin/reports/payments` | `GET /ulms/admin/reports/payments` |
| **Báo cáo Hội viên** | `/admin/reports/memberships` | `GET /ulms/admin/reports/memberships` |
| **Phát Thông báo** | `/admin/notifications/broadcast` | `POST /ulms/admin/notifications/broadcast`<br>`GET /ulms/admin/notifications/history` |
| **Nghiệp vụ Thủ thư** | `/librarian/**` | Toàn quyền sử dụng mọi màn hình thủ thư |
