# TÀI LIỆU HƯỚNG DẪN KIỂM THỬ CÁC LUỒNG NGHIỆP VỤ CHÍNH VÀ TƯƠNG TÁC GIỮA CÁC ROLE
**Hệ thống Quản lý Thư viện Đại học Thông minh (ULMS - University Library Management System)**

---

## I. THÔNG TIN MÔI TRƯỜNG & TÀI KHOẢN KIỂM THỬ

### 1. Địa chỉ dịch vụ
- **Giao diện người dùng (Frontend):** `http://localhost:5173`
- **Hệ thống máy chủ API (Backend):** `http://localhost:8080/ulms`
- **Cổng thanh toán VNPay Sandbox:** Thẻ test `NCB` - Số thẻ: `9704198526191432198` - Tên: `NGUYEN VAN A` - Ngày phát hành: `07/15` - OTP: `123456`

### 2. Danh sách tài khoản thử nghiệm theo từng Role
| Vai trò (Role) | Email đăng nhập | Mật khẩu | Họ và tên | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **READER (Độc giả)** | `reader@gmail.com` | `123456` | Nguyễn Văn An | Mượn sách, đặt giữ, đọc E-Book, mua gói hội viên, nộp cọc |
| **READER 2 (Độc giả 2)** | `reader2@gmail.com` | `123456` | Lê Hoàng Nam | Độc giả phụ dùng để test tương tác đồng thời |
| **LIBRARIAN (Thủ thư)** | `librarian@gmail.com` | `123456` | Trần Thị Bình | Duyệt đơn giữ sách, cho mượn tại quầy, thu cọc, trả sách, thu phạt |
| **ADMIN (Quản trị viên)** | `admin@gmail.com` | `123456` | Lê Văn Cường | Quản lý tác giả/NXB/thể loại, phân quyền người dùng, chỉnh cấu hình hệ thống |

> **Mẹo kiểm thử đa vai trò:** Mở 2 cửa sổ trình duyệt song song (1 cửa sổ thường cho **READER** và 1 cửa sổ ẩn danh **Incognito** cho **LIBRARIAN** hoặc **ADMIN**) để quan sát sự tương tác real-time giữa các vai trò mà không bị ghi đè phiên đăng nhập.

---

## II. CHI TIẾT CÁC LUỒNG TƯƠNG TÁC CHÍNH GIỮA CÁC ROLE

```
                   LUỒNG TƯƠNG TÁC TỔNG THỂ (END-TO-END)
                   
     [READER]                          [LIBRARIAN]                      [ADMIN]
        │                                   │                              │
        ├─ 1. Đặt giữ chỗ online ──────────>│                              │
        │                                   ├─ 2. Phê duyệt đơn giữ        │
        │<── Nhận thông báo đã duyệt ───────┤                              │
        │                                   │                              │
        ├─ 3. Đến quầy nhận sách ──────────>│                              │
        │<── Thu cọc (CASH / VNPay) ────────┤                              │
        │<── Bàn giao sách (Phiếu mượn) ────┤                              │
        │                                   │                              │
        ├─ 4. Gia hạn sách online (Web)     │                              │
        │                                   │                              │
        ├─ 5. Mang sách đến trả ───────────>│                              │
        │                                   ├─ 6. Kiểm tra mã vạch & hạn   │
        │                                   ├─ 7. Tính phạt nếu hỏng/trễ   │
        │<── Nhận lại tiền cọc (CASH) ──────┤                              │
        │                                   │                              │
        │                                   │<── 8. Chỉnh cấu hình phạt ───┤
        │                                   │<── 9. Thêm tác giả/sách mới ─┤
```

---

### KỊCH BẢN 1: ĐẶT GIỮ SÁCH ONLINE & NHẬN SÁCH TẠI QUẦY (READER ⟷ LIBRARIAN)
*Mục đích: Kiểm tra quy trình từ lúc độc giả tìm sách trên Web, đặt trước đến khi thủ thư duyệt và bàn giao sách tại quầy.*

#### Bước 1: Reader đặt giữ sách trên giao diện Web
1. Đăng nhập tài khoản **READER** (`reader@gmail.com` / `123456`).
2. Vào trang **Kho sách** (`/books`), chọn 1 cuốn sách bất kỳ (ví dụ: *Clean Code* hoặc *Effective Java*).
3. Bấm **"Thêm vào giỏ mượn"** (nút Mượn trên Card hoặc trong trang Chi tiết sách).
4. Mở **Giỏ mượn** (biểu tượng túi xách trên thanh Navbar):
   - Kiểm tra: Không còn hiển thị "Giá cọc định mức" gây rối theo đúng yêu cầu đã sửa.
   - Bấm nút **"Xác nhận đặt giữ sách"** (Tạo Reservation).
5. Chuyển sang mục **"Phiếu đặt trước của tôi"** (`/reservations`): Đơn đặt giữ hiển thị trạng thái `PENDING` (Chờ thủ thư duyệt).

#### Bước 2: Librarian duyệt đơn đặt giữ
1. Mở cửa sổ ẩn danh, đăng nhập tài khoản **LIBRARIAN** (`librarian@gmail.com` / `123456`). Hệ thống tự động chuyển thẳng vào Dashboard của Thủ thư.
2. Vào menu **Quản lý Đặt giữ** (`/librarian/reservations`).
3. Tìm đơn đặt của độc giả *Nguyễn Văn An* ở tab **Chờ duyệt**:
   - Thấy danh sách sách độc giả muốn mượn.
   - Bấm nút **"Phê duyệt"** (Approve).
   - Hệ thống hiển thị thông báo duyệt thành công, đơn chuyển sang trạng thái `APPROVED` và bắt đầu đếm thời gian giữ sách (mặc định 3 ngày).

#### Bước 3: Reader nhận thông báo thời gian thực
1. Quay lại màn hình **READER**:
   - Quả chuông thông báo (Notification) trên Navbar tự động cập nhật số lượng thông báo mới (cơ chế Real-time polling).
   - Mở xem thông báo: *"Đơn đặt trước sách của bạn đã được thủ thư phê duyệt thành công!"*.
   - Trang `/reservations` chuyển trạng thái sang `ĐÃ DUYỆT` kèm hạn nhận sách.

#### Bước 4: Hoàn tất nhận sách tại quầy thư viện
1. Tại màn hình **LIBRARIAN**, vào menu **Quản lý Mượn trả** (`/librarian/borrows`):
   - Bấm **"Tạo phiếu mượn mới"**.
   - Có thể chọn chuyển đổi từ đơn đặt giữ đã duyệt hoặc quét trực tiếp barcode sách vật lý (`CC-0001`).
   - Nhập thông tin độc giả: Hệ thống tự động hiển thị số tiền cọc cần thu (được tự động giảm trừ nếu độc giả có gói hội viên).
   - Chọn phương thức nộp cọc: Hỗ trợ linh hoạt cả **Tiền mặt (CASH)** và **VNPay QR Code**.
   - Bấm **"Xác nhận tạo phiếu mượn"**.
2. Kiểm tra:
   - Bản sao sách vật lý tự động đổi trạng thái sang `BORROWED`.
   - Reader vào mục **"Lịch sử mượn trả"** (`/borrow-records`) thấy ngay phiếu mượn đang trong trạng thái `ĐANG MƯỢN` kèm chi tiết sách và hạn trả.

---

### KỊCH BẢN 2: GIA HẠN SÁCH ONLINE BẰNG MODAL NỔI (READER)
*Mục đích: Kiểm tra tính năng tự gia hạn thời hạn mượn sách của độc giả mà không bị dùng popup `alert()` trình duyệt.*

1. Đăng nhập tài khoản **READER** (`reader@gmail.com`).
2. Vào trang **Lịch sử mượn trả** (`/borrow-records`).
3. Chọn một phiếu đang mượn có nút **"Gia hạn sách"**:
   - Bấm nút **"Gia hạn"**.
   - **Kết quả mong đợi:** Xuất hiện **Hộp thoại Modal nổi hiện đại (Custom Floating Modal)** thay vì lệnh `window.confirm()` thô sơ của trình duyệt. Modal thể hiện rõ số ngày được gia hạn thêm (+7 ngày) và số lần gia hạn còn lại (tối đa 1 lần).
4. Bấm **"Đồng ý gia hạn"**:
   - Xuất hiện **Toast thông báo nổi góc phải** báo gia hạn thành công.
   - Hạn trả mới (`due_date`) được cộng thêm 7 ngày.
   - Nút gia hạn chuyển sang trạng thái đã dùng hết lượt.

---

### KỊCH BẢN 3: TRẢ SÁCH, TÍNH TIỀN PHẠT & HOÀN CỌC TẠI QUẦY (READER ⟷ LIBRARIAN)
*Mục đích: Kiểm tra quy trình nhận trả sách vật lý, phát hiện hỏng sách/quá hạn, tính phạt và hoàn cọc.*

#### Bước 1: Thủ thư thực hiện nhận trả sách
1. Đăng nhập **LIBRARIAN**, vào menu **Quản lý Mượn trả** (`/librarian/borrows`).
2. Tại tab danh sách phiếu mượn đang lưu hành, chọn phiếu của độc giả cần trả và bấm **"Nhận trả sách"**:
   - Thủ thư kiểm tra tình trạng từng cuốn sách:
     - **Bình thường (Normal):** Không phát sinh chi phí.
     - **Hỏng nhẹ / Rách bìa (Damaged):** Nhập tiền phạt hư hỏng (ví dụ: 30.000đ).
     - **Làm mất sách (Lost):** Phạt theo giá trị sách.
   - Nếu phiếu mượn bị quá hạn: Hệ thống tự động tính số ngày quá hạn × `FINE_PER_DAY` (5.000đ/ngày).

#### Bước 2: Thanh toán tiền phạt đa kênh
1. Nếu có tiền phạt phát sinh, thủ thư có quyền chọn cách thu:
   - **Thu bằng TIỀN MẶT (CASH)** trực tiếp tại quầy.
   - **Thanh toán qua VNPAY:** Hệ thống sinh mã giao dịch/QR để độc giả quét thanh toán ngay.
2. Hoàn cọc:
   - Hệ thống hiển thị số tiền cọc ban đầu độc giả đã nộp.
   - Bấm xác nhận hoàn cọc tiền mặt cho độc giả.
   - Phiếu mượn chuyển trạng thái `RETURNED` (Đã trả), bản sao sách tự động quay về trạng thái `AVAILABLE` (Sẵn sàng phục vụ lượt mượn tiếp theo).

---

### KỊCH BẢN 4: ĐĂNG KÝ GÓI HỘI VIÊN & HƯỞNG ƯU ĐÃI CỌC (READER ⟷ HỆ THỐNG)
*Mục đích: Độc giả thanh toán gói hội viên qua VNPay Sandbox và kiểm chứng quyền lợi miễn cọc.*

1. Đăng nhập **READER** (`reader@gmail.com`).
2. Vào mục **Gói hội viên** (`/plans`) trên thanh điều hướng.
3. Chọn gói **PREMIUM** (Giá: 300.000đ / 365 ngày - Quyền lợi: Miễn 100% cọc cho sách dưới 500.000đ, đọc trọn bộ E-Book).
4. Bấm **"Đăng ký ngay"** -> Hệ thống chuyển hướng sang cổng thanh toán **VNPay Sandbox**:
   - Chọn ngân hàng: `NCB`.
   - Số thẻ: `9704198526191432198`.
   - Tên chủ thẻ: `NGUYEN VAN A`.
   - Ngày phát hành: `07/15`.
   - Nhập OTP: `123456`.
5. Sau khi thanh toán thành công, VNPay redirect về trang kết quả của thư viện:
   - Hiển thị thông báo đăng ký gói Premium thành công.
   - Vào mục **Hồ sơ cá nhân** (`/profile`): Huy hiệu tài khoản chuyển sang **PREMIUM** kèm ngày hết hạn sau 1 năm.
6. **Kiểm chứng ưu đãi:**
   - Mượn 1 cuốn sách có giá dưới 500.000đ (như *Clean Code* 250.000đ).
   - Khi tạo phiếu mượn, trường `deposit_amount` sẽ bằng **0đ** (Miễn cọc hoàn toàn).

---

### KỊCH BẢN 5: ĐỌC E-BOOK TRỰC TUYẾN & TỰ ĐỘNG LƯU TIẾN ĐỘ (READER)
*Mục đích: Kiểm tra trình đọc PDF E-Book không bị lộ thanh taskbar tải file của trình duyệt, chuyển trang mượt mà và lưu tiến độ trang.*

1. Đăng nhập **READER**, vào trang chi tiết sách có bản điện tử (ví dụ: *Clean Code* - sách có huy hiệu `E-Book`).
2. Bấm nút **"Đọc E-Book Online"** -> Chuyển vào giao diện `/ebook/:bookId`.
3. Kiểm tra trình đọc sách:
   - Giao diện được nhúng an toàn, **không hiển thị thanh công cụ tải về / in ấn mặc định của PDF**.
   - Có thanh tiến độ đọc, nút Chuyển trang trước / trang sau, và ô nhảy nhanh đến trang mong muốn.
4. Lật đến trang **15**, sau đó đóng trình duyệt hoặc bấm nút quay lại Trang chủ.
5. Kiểm tra tại **Trang chủ** (`/`):
   - Xuất hiện khối banner **"Tiếp tục đọc E-Book"**.
   - Hiển thị đúng cuốn *Clean Code* kèm thông tin *"Đang đọc dở tại trang 15"*.
   - Bấm vào banner sẽ mở thẳng đến trang 15 mà không phải lật lại từ đầu.

---

### KỊCH BẢN 6: QUẢN LÝ KHO SÁCH & UPLOAD CLOUDINARY (LIBRARIAN)
*Mục đích: Kiểm tra chức năng thêm sách, upload ảnh bìa/PDF trực tiếp từ máy tính lên Cloudinary, thêm bản sao hàng loạt.*

1. Đăng nhập tài khoản **LIBRARIAN**, vào menu **Quản lý Sách** (`/librarian/books`).
2. Bấm **"Thêm sách mới"**:
   - Nhập tên sách, mã ISBN, giá bìa, thể loại, NXB.
   - Tại mục **Tác giả**: Chọn tác giả trong danh sách -> Ngay bên dưới xuất hiện **Chip Preview hiển thị avatar chân dung sắc nét và tiểu sử rút gọn của tác giả**.
   - Tại mục **Ảnh bìa**: Bấm **"Chọn ảnh bìa từ máy"** -> Chọn file ảnh `.png/.jpg` bất kỳ từ máy tính -> Hệ thống tự động upload lên Cloudinary và điền URL an toàn vào form.
   - Tại mục **E-Book PDF**: Bấm **"Chọn file PDF từ máy"** -> Chọn file `.pdf` từ máy tính -> Tự động upload lên Cloudinary.
3. Bấm **"Lưu sách mới"** -> Sách xuất hiện ngay lập tức trên trang chủ và kho sách của Reader.
4. **Thêm bản sao hàng loạt (Batch Copies):**
   - Tại dòng cuốn sách vừa tạo, bấm **"Quản lý bản sao"**.
   - Chọn tab **"Thêm hàng loạt"**: Nhập tiền tố barcode (ví dụ: `TEST`), số lượng cần thêm (ví dụ: `5` cuốn).
   - Bấm **"Sinh bản sao"**: Hệ thống tạo đồng thời 5 mã vạch (`TEST-0001` đến `TEST-0005`) trong cơ sở dữ liệu.

---

### KỊCH BẢN 7: QUẢN TRỊ DỮ LIỆU NỀN TẢNG & CẤU HÌNH HỆ THỐNG (ADMIN)
*Mục đích: Kiểm tra quyền quản trị của Admin đối với Tác giả (Avatar Cloudinary), Người dùng và Cấu hình tham số nghiệp vụ.*

#### 1. Quản lý tác giả với Avatar sắc nét
1. Đăng nhập **ADMIN** (`admin@gmail.com` / `123456`).
2. Vào menu **Dữ liệu nền tảng** (`/admin/master-data`), chọn tab **Tác giả**:
   - Danh sách hiển thị đầy đủ avatar hình tròn, tên tác giả và ID.
   - Bấm **"Thêm tác giả mới"**:
     - Nhập tên tác giả, tiểu sử.
     - Bấm nút **"Chọn ảnh từ máy"** -> Chọn ảnh chân dung từ máy tính -> Upload thành công lên Cloudinary kèm ảnh xem trước (Preview).
     - Bấm **"Lưu tác giả"**.
   - Kiểm tra: Tác giả mới xuất hiện ngay tại trang `/authors` của Reader và trong dropdown chọn tác giả của Librarian.

#### 2. Cấu hình hệ thống (Settings Management)
1. Vào menu **Cấu hình hệ thống** (`/admin/settings`):
   - Các tham số nghiệp vụ hiển thị kèm đơn vị đo rõ ràng (VNĐ, Ngày, Lần, Cuốn).
   - Thử thay đổi: `FINE_PER_DAY` (Mức phạt quá hạn) từ `5000` lên `10000` VNĐ/ngày.
   - Bấm **"Lưu cấu hình"**.
   - Kiểm tra: Khi Librarian thực hiện trả sách quá hạn cho Reader, hệ thống tự động tính mức phạt mới là 10.000đ/ngày.

#### 3. Quản lý người dùng & Phân quyền
1. Vào menu **Người dùng** (`/admin/users`):
   - Thống kê danh sách độc giả, thủ thư.
   - Có thể thực hiện **Khóa tài khoản (Lock)** hoặc **Mở khóa (Unlock)**.
   - Bấm **"Thêm tài khoản nhân viên"** để cấp tài khoản cho thủ thư mới mà không cần qua quy trình đăng ký độc giả.

---

### KỊCH BẢN 8: KIỂM TRA ĐĂNG NHẬP ĐA PHƯƠNG THỨC & ĐIỀU HƯỚNG THEO ROLE
*Mục đích: Đảm bảo điều hướng đúng Dashboard của từng Role khi đăng nhập, giữ nguyên nút Google Sign-In và không còn phần "Tài khoản mẫu" thừa.*

1. Truy cập trang đăng nhập `/login`:
   - Xác nhận: Phần "Đăng nhập nhanh (Tài khoản mẫu)" đã được gỡ bỏ hoàn toàn theo yêu cầu.
   - Nút **"Đăng nhập bằng Google"** hiển thị rõ ràng, chuyên nghiệp.
   - Ô mật khẩu có icon 👁️ bật/tắt ẩn hiện mật khẩu rõ ràng.
2. Kiểm tra điều hướng tự động:
   - Đăng nhập tài khoản **Librarian** -> Tự động chuyển thẳng tới `/librarian/dashboard`.
   - Đăng nhập tài khoản **Admin** -> Tự động chuyển thẳng tới `/admin/dashboard`.
   - Đăng nhập tài khoản **Reader** -> Tự động vào trang chủ `/` kèm thông tin cá nhân trên Navbar.

---

## III. BẢNG CHECKLIST NGHIỆM THU TỔNG THỂ

| STT | Luồng kiểm thử | Role thực hiện | Kết quả mong đợi | Trạng thái |
| :---: | :--- | :---: | :--- | :---: |
| 1 | Hiển thị tiền tệ VNĐ | Toàn hệ thống | Làm tròn chuẩn tiền Việt (ví dụ `150.000 ₫`), không bị lẻ số thập phân | ĐẠT |
| 2 | Đặt giữ sách online | Reader ⟷ Librarian | Giỏ mượn không hiện giá cọc định mức; duyệt đơn sinh reservation chuẩn | ĐẠT |
| 3 | Thông báo Real-time | Reader | Notification tự động gọi định kỳ, có badge chuông khi đơn được duyệt | ĐẠT |
| 4 | Gia hạn sách bằng modal | Reader | Hiện floating modal xác nhận và toast nổi góc phải thay cho alert() | ĐẠT |
| 5 | Nộp cọc đa kênh | Reader ⟷ Librarian | Hỗ trợ cả CASH và VNPAY tại quầy cho Thủ thư | ĐẠT |
| 6 | Trình đọc E-Book PDF | Reader | Đọc trang mượt mà, ẩn thanh bar trình duyệt, lưu tiến độ tự động | ĐẠT |
| 7 | Upload Cloudinary trực tiếp | Librarian / Admin | Chọn file ảnh bìa, avatar tác giả, file PDF từ máy upload trực tiếp | ĐẠT |
| 8 | Hiển thị Avatar tác giả | Toàn hệ thống | Hiển thị ảnh chân dung ở trang tác giả, chi tiết sách, bảng sách thủ thư | ĐẠT |
| 9 | Thêm bản sao hàng loạt | Librarian | Sinh hàng loạt barcode theo tiền tố và số lượng chỉ với 1 cú click | ĐẠT |
| 10 | Điều hướng theo Role | Auth | Login role nào tự động vào đúng Dashboard của role đó | ĐẠT |

---

### KỊCH BẢN 6: ĐỘC GIẢ PREMIUM MIỄN 100% TIỀN CỌC & BÀN GIAO SÁCH TẠI QUẦY (READER ⟷ LIBRARIAN)
*Mục đích: Kiểm tra trường hợp độc giả có gói hội viên Premium, hệ thống tính tiền cọc = 0đ, tự động miễn cọc và thủ thư bàn giao sách ngay tại quầy mà không bắt nộp 0đ qua VNPay.*

1. **Chuẩn bị:** Độc giả đăng nhập tài khoản có gói Premium (hoặc mua gói Premium tại `/plans`).
2. **Đặt mượn sách:** Độc giả vào `/books`, chọn sách và gửi đơn đặt trước.
3. **Thủ thư duyệt đơn:** Thủ thư vào `/librarian/reservations`, duyệt đơn đặt sách.
   - **Kết quả mong đợi:** Phiếu mượn `BorrowRecord` được tạo với `depositAmount = 0đ` và trạng thái cọc `depositStatus = 0 (Miễn tiền cọc)`.
4. **Kiểm tra giao diện Reader:** Độc giả vào `/reservations` và `/borrow-records`:
   - Thấy huy hiệu **"Miễn tiền cọc"** màu tím.
   - **Không hiển thị nút "Nộp tiền cọc"**, không bắt thanh toán 0 VNĐ.
   - Trong modal chi tiết ticket, bấm nút **"Lịch sử mượn trả"** chuyển hướng mượt mà đến `/borrow-records` (không bị 404).
5. **Thủ thư bàn giao sách tại quầy:** Thủ thư vào `/librarian/borrows`:
   - Nút **"Bàn giao"** hiển thị sẵn sàng (không hiện nút Thu cọc vì tiền cọc = 0đ).
   - Bấm **"Bàn giao"** và xác nhận: Hệ thống thực hiện bàn giao sách thành công sang trạng thái `ĐANG MƯỢN`, không bị chặn lỗi bắt nộp cọc.

---

### KỊCH BẢN 7: THANH TOÁN VNPAY CALLBACK CHUYÊN BIỆT & ĐẾM NGƯỢC 5 GIÂY TỰ ĐỘNG CHUYỂN HƯỚNG
*Mục đích: Kiểm tra giao diện kết quả giao dịch VNPay độc lập (ẩn Navbar/Footer/Chatbot) và tự động quay về đúng trang yêu cầu sau 5 giây.*

1. **Thực hiện giao dịch qua VNPay:**
   - Độc giả nộp phạt tại `/fines`, mua gói hội viên tại `/plans`, hoặc nộp tiền cọc tại `/borrow-records`.
   - Thủ thư tạo link thu tiền phạt qua VNPay tại `/librarian/fines`.
2. **Thanh toán trên VNPay Sandbox:** Nhập thông tin thẻ test NCB và hoàn tất xác thực OTP `123456`.
3. **Kết quả trả về trên trang Callback (`/payment/callback`):**
   - **Giao diện độc lập:** Không hiển thị thanh Taskbar (Navbar trên), không có Footer ở dưới, không có Widget Chat AI. Màn hình chỉ tập trung vào hộp thông báo kết quả giao dịch ở chính giữa.
   - **Thông điệp chính xác:**
     - Nộp phạt: *"Khoản tiền phạt đã được thanh toán thành công và tự động gỡ hạn chế trên hệ thống!"*
     - Gói hội viên: *"Chúc mừng bạn đã kích hoạt gói hội viên thành công!"*
     - Tiền cọc: *"Thanh toán tiền cọc thành công! Bạn có thể đến quầy thư viện để nhận sách."*
   - **Đồng hồ đếm ngược 5 giây:** Hiển thị thông báo: *"Tự động quay về [Tên trang] sau: 5 giây"* kèm thanh tiến trình (progress bar) thu nhỏ dần.
   - **Tự động chuyển hướng:** Hết 5 giây, hệ thống tự động đưa người dùng quay lại đúng trang trước đó:
     - Nộp phạt độc giả ➔ tự về `/fines`
     - Thu phạt thủ thư ➔ tự về `/librarian/fines`
     - Mua gói ➔ tự về `/plans`
     - Nộp cọc ➔ tự về `/borrow-records`
   - Người dùng cũng có thể bấm nút **"Chuyển về [Trang] ngay (X giây)"** để quay lại tức thì mà không cần chờ.

---

### KỊCH BẢN 8: XÁC THỰC DỮ LIỆU FORM PROFILE & TÀI KHOẢN ĐĂNG KÝ BẰNG EMAIL
*Mục đích: Kiểm tra validation form thông tin cá nhân và cập nhật hồ sơ cho tài khoản đăng ký bằng Email.*

1. Đăng nhập tài khoản độc giả tạo qua Email/Google (ban đầu số điện thoại rỗng `phone = null`).
2. Vào trang **Hồ sơ cá nhân** (`/profile`).
3. **Kiểm tra nhập liệu:**
   - **Ô số điện thoại:** Thử gõ chữ cái -> Hệ thống tự động chặn chỉ nhận số. Nhập thử 9 số hoặc không bắt đầu bằng số 0 -> Báo lỗi: *"Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0"*.
   - **Ô Họ và tên:** Nhập tên có chữ số hoặc ký tự lạ -> Báo lỗi đỏ bên dưới. Nhập tên tiếng Việt có dấu và chữ `Đ`, `đ` (ví dụ: *Đặng Tiến Đạt*) -> Hợp lệ.
   - **Ô Địa chỉ:** Nhập dưới 5 ký tự -> Báo lỗi: *"Địa chỉ cần ít nhất 5 ký tự..."*.
   - **Đổi mật khẩu:** Nhập mật khẩu yếu (không có ký tự đặc biệt hoặc chữ hoa) -> Báo lỗi yêu cầu đầy đủ hoa, thường, số, ký tự đặc biệt.
4. Nhập đầy đủ thông tin hợp lệ và bấm **"Lưu thay đổi"**:
   - Hệ thống cập nhật thành công, không bị lỗi NullPointerException của tài khoản Email.
