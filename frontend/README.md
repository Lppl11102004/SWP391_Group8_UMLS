# ULMS - University Library Management System (Frontend)

Giao diện người dùng (Frontend) xây dựng bằng **React JS**, **Vite**, **Tailwind CSS v4** và **Lucide Icons** cho hệ thống Quản lý Thư viện Đại học (ULMS), kết nối toàn bộ hệ thống API Backend (Spring Boot 3, Spring Security JWT, SQL Server, VNPay Sandbox, Cloudinary).

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Cài đặt thư viện
```bash
cd frontend
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
- Ứng dụng chạy tại: `http://localhost:5173`
- Dev server đã được cấu hình Proxy tự động chuyển tiếp các request `/ulms` và `/api` sang Backend `http://localhost:8080`.

### 3. Đóng gói cho Production
```bash
npm run build
```

---

## 📁 Cấu Trúc Thư Mục & Mapping Các Trang

```
src/
├── api/                             # Bộ gọi API Axios & các module dịch vụ
│   ├── client.js                    # Cấu hình Axios instance & JWT Interceptor
│   ├── auth.js                      # Đăng ký, đăng nhập, OTP, đổi mật khẩu
│   ├── books.js                     # Tra cứu sách, chi tiết, đánh giá, thể loại, NXB
│   ├── authors.js                   # Danh sách & chi tiết tác giả
│   ├── membership.js                # Gói hội viên, quy định & thanh toán
│   ├── cartAndReservation.js        # Giỏ mượn sách & phiếu đặt giữ chỗ
│   ├── ebook.js                     # Đọc E-Book PDF stream & lưu tiến độ đọc
│   ├── notifications.js             # Danh sách thông báo & đánh dấu đã đọc
│   ├── user.js                      # Xem/sửa hồ sơ, đổi mật khẩu, upload avatar
│   └── payment.js                   # Xử lý kết quả callback VNPay
├── context/                         # State Management toàn cục
│   ├── AuthContext.jsx              # Trạng thái đăng nhập, User info, Token
│   ├── CartContext.jsx              # Số lượng & danh sách sách trong giỏ mượn
│   └── NotificationContext.jsx      # Chuông thông báo & trạng thái đã đọc
├── components/                      # Component dùng chung
│   ├── Navbar.jsx                   # Thanh điều hướng, tìm kiếm nhanh, giỏ, chuông, user avatar
│   ├── Footer.jsx                   # Chân trang thư viện
│   ├── BookCard.jsx                 # Thẻ sách kèm nút mượn & huy hiệu E-Book
│   └── ProtectedRoute.jsx           # Bảo vệ các route yêu cầu đăng nhập READER
└── pages/                           # Các trang chức năng
    ├── auth/
    │   ├── LoginPage.jsx            # Đăng nhập (Local & nút Google)
    │   ├── RegisterPage.jsx         # Đăng ký tài khoản độc giả
    │   ├── VerifyEmailPage.jsx      # Xác thực OTP kích hoạt tài khoản
    │   └── ForgotPasswordPage.jsx   # Quên mật khẩu & cấp lại bằng OTP
    ├── Home.jsx                     # Trang chủ (Banner, Sách mới, Danh mục, Gói hội viên)
    ├── BookCatalog.jsx              # Tìm kiếm & bộ lọc nâng cao (Thể loại, NXB, Tác giả, Giá, Năm)
    ├── BookDetail.jsx               # Chi tiết sách, đánh giá, nút đọc E-Book
    ├── EBookReader.jsx              # Trình đọc PDF trực tiếp từ luồng nhị phân & lưu tiến độ
    ├── Authors.jsx                  # Danh mục tác giả & sách theo tác giả
    ├── BorrowCart.jsx               # Giỏ mượn sách & tạo phiếu đặt chỗ
    ├── MyReservations.jsx           # Quản lý danh sách phiếu mượn & huỷ phiếu
    ├── MembershipPlans.jsx          # Bảng so sánh gói hội viên, quy định & thanh toán VNPay
    ├── PaymentCallback.jsx          # Màn hình kết quả trả về từ VNPay
    └── Profile.jsx                  # Hồ sơ độc giả, cập nhật thông tin & đổi mật khẩu
```

---

## 🔑 Bảng Phân Quyền & Route Mapping

| Đường dẫn (Route) | Tên Trang / Chức năng | Phân Quyền | API Tương Ứng |
| :--- | :--- | :---: | :--- |
| `/` | Trang chủ | Công khai | `GET /ulms`, `GET /ulms/categories`, `GET /ulms/plans` |
| `/books` | Kho sách & Bộ lọc | Công khai | `GET /ulms/search`, `GET /ulms/categories`, `GET /ulms/publishers`, `GET /ulms/authors` |
| `/books/:id` | Chi tiết sách | Công khai | `GET /ulms/books/{id}`, `GET /ulms/books/{id}/reviews`, `GET /ulms/books/{id}/info` |
| `/authors`, `/authors/:id` | Tác giả & Tác phẩm | Công khai | `GET /ulms/authors`, `GET /ulms/authors/{id}` |
| `/plans` | Gói hội viên & Quy định | Công khai / Reader | `GET /ulms/plans`, `GET /ulms/rules`, `POST /ulms/plans` |
| `/login` | Đăng nhập | Guest | `POST /ulms/auth/login`, `POST /ulms/auth/google` |
| `/register` | Đăng ký | Guest | `POST /ulms/auth/register` |
| `/verify-email` | Xác thực email | Guest | `POST /ulms/auth/verify-email`, `POST /ulms/auth/resend-OTP-verify` |
| `/forgot-password` | Quên mật khẩu | Guest | `POST /ulms/auth/resend-OTP-verify`, `POST /ulms/auth/reset-password` |
| `/payment/callback` | Kết quả thanh toán VNPay | Công khai | `GET /api/payment/vnpay-callback` |
| `/cart` | Giỏ mượn sách | **READER** | `GET /ulms/add-to-cart`, `DELETE /ulms/add-to-cart/{id}`, `POST /ulms/reservation` |
| `/reservations` | Phiếu đặt mượn sách | **READER** | `GET /ulms/reservation`, `GET /ulms/reservation/{id}`, `PUT /ulms/reservation/{id}` |
| `/books/:id/read` | Trình đọc E-Book PDF | **READER (Có gói)** | `GET /ulms/books/{id}/info`, `GET /ulms/books/{id}/read`, `GET/PUT /ulms/books/{id}/progress` |
| `/profile` | Hồ sơ cá nhân | **READER** | `GET /ulms/me`, `PUT /ulms/me`, `POST /ulms/me`, `POST /ulms/me/avatar` |
