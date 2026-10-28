CREATE DATABASE ULMS;
GO
USE ULMS;
GO
--ROLE ====================================================================
CREATE TABLE roles (
    role_id     TINYINT PRIMARY KEY, 
    role_name   VARCHAR(30) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    created_at  DATETIME NOT NULL DEFAULT GETDATE()
);

 --AUTHENTICATION ==================================================================
CREATE TABLE users (
    user_id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name         NVARCHAR(100) NOT NULL,
    email             VARCHAR(255)  NOT NULL UNIQUE,
    password_hash     VARCHAR(255)  NULL,  -- NULL = GooGle
    phone             VARCHAR(20)   NULL,
    avatar_url        VARCHAR(500)  NULL,
    address           VARCHAR(500)  NULL,
    role_id           TINYINT NOT NULL DEFAULT 1,
    status            TINYINT NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3)), -- 0:PENDING_VERIFICATION 1:ACTIVE 2:LOCKED 3:INACTIVE
    last_login_at     DATETIME NULL,
    created_at        DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at        DATETIME NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

CREATE TABLE user_auth (
    auth_id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    provider       VARCHAR(20)  NOT NULL CHECK (provider IN ('GOOGLE')),
    provider_id    VARCHAR(255) NOT NULL,              -- Google "sub"
    provider_email VARCHAR(255) NULL,
    created_at     DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_UserAuth_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT UQ_UserAuth_Provider     UNIQUE (provider, provider_id),
    CONSTRAINT UQ_UserAuth_UserProvider UNIQUE (user_id, provider)
);

CREATE TABLE user_tokens (
    token_id   BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    token_type BIT NOT NULL, -- 0:'EMAIL_VERIFY', 1:'PASSWORD_RESET'
    token_hash CHAR(64) NOT NULL UNIQUE, 
    expires_at DATETIME NOT NULL,
    used       BIT NOT NULL DEFAULT 0,  -- 0: 'UNUSED', 1: 'USED'
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_UserTokens_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- CATALOG ==============================================
CREATE TABLE authors (
    author_id   INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(150) COLLATE SQL_Latin1_General_CP1_CI_AI NOT NULL,
    bio         NVARCHAR(MAX) NULL,
    avatar_url  VARCHAR(500)  NULL,
    created_at  DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL
);

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    created_at  DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL
);

CREATE TABLE publishers (
    publisher_id INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(150) NOT NULL UNIQUE,
    address      NVARCHAR(255) NULL,
    created_at   DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL
);

CREATE TABLE books (
    book_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(255) COLLATE SQL_Latin1_General_CP1_CI_AI NOT NULL,
    isbn            VARCHAR(20) NULL UNIQUE,
    price           DECIMAL(12,2) NOT NULL DEFAULT 0, -- QUAN TRỌNG: để tính cọc & hạn mượn
    category_id     INT NOT NULL,
    publisher_id    INT NULL,
    author_id       INT NOT NULL,
    published_year  INT NULL,
    description     NVARCHAR(MAX) NULL,
    status          BIT DEFAULT 1,  -- 0:UNACTIVE, 1: ACTIVE
    cover_image_url VARCHAR(500) NULL,               -- Ảnh bìa chính
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME NULL,
    CONSTRAINT FK_Books_Author FOREIGN KEY (author_id) REFERENCES Authors(author_id),
    CONSTRAINT FK_Books_Categories FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    CONSTRAINT FK_Books_Publishers FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
);

CREATE TABLE book_images (
    image_id   BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id    BIGINT NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL,
    CONSTRAINT FK_BookImages_Books FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE TABLE book_copies (
    copy_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id     BIGINT NOT NULL,
    barcode     VARCHAR(50) NOT NULL UNIQUE, -- Mã vạch dán trên gáy sách để thủ thư quét
    status      TINYINT NOT NULL DEFAULT 1,  -- 1: AVAILABLE, 2: BORROWED, 3: DAMAGED, 4: LOST
    created_at  DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL,
    CONSTRAINT FK_BookCopies_Books FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id    BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id      BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    rating       TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      NVARCHAR(1000) NULL,
    status       TINYINT NOT NULL DEFAULT 1  CHECK (status IN (0, 1)),-- 1: ACTIVE, 0: HIDDEN
    created_at   DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME NULL,
    -- 1 user chỉ được review 1 lần cho 1 sách
    CONSTRAINT UQ_Reviews_Book_User UNIQUE (book_id, user_id),
    CONSTRAINT FK_Reviews_Books FOREIGN KEY (book_id) REFERENCES Books(book_id),
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE e_books (
    ebook_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id       BIGINT NOT NULL UNIQUE,      -- Mỗi đầu sách 1 bản điện tử (1-1)
    file_url      VARCHAR(500) NOT NULL,       -- Link file PDF / EPUB lưu trữ
    file_size_kb  INT NULL,
    total_pages   INT NULL,
    created_at    DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME NULL,
    CONSTRAINT FK_EBooks_Books FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE TABLE ebook_reading_progress (
    progress_id   BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    ebook_id      BIGINT NOT NULL,
    current_page  INT NOT NULL DEFAULT 1,
    last_read_at  DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ReadingProgress_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_ReadingProgress_EBooks FOREIGN KEY (ebook_id) REFERENCES E_Books(ebook_id) ON DELETE CASCADE,
    CONSTRAINT UQ_User_EBook UNIQUE (user_id, ebook_id) -- 1 user với 1 ebook chỉ có 1 dòng tiến độ
);

CREATE TABLE borrow_cart (
    cart_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id     BIGINT NOT NULL,                    -- Độc giả sở hữu giỏ
    book_id     BIGINT NOT NULL,                    -- Đầu sách muốn mượn
    
    created_at  DATETIME NOT NULL DEFAULT GETDATE(), -- Thời điểm thêm vào giỏ
    
    CONSTRAINT FK_BorrowCart_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_BorrowCart_Books FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
    
    -- RÀNG BUỘC: Mỗi đầu sách chỉ nằm trong giỏ của 1 user 1 lần (không cần cột quantity vì mỗi độc giả chỉ mượn 1 cuốn/đầu sách)
    CONSTRAINT UQ_User_Book_Cart UNIQUE (user_id, book_id)
);
CREATE INDEX IX_BorrowCart_User ON Borrow_Cart(user_id);

-- SYSTEM & MEMBER PLANS ==========================
CREATE TABLE settings (
    setting_id    INT IDENTITY(1,1) PRIMARY KEY,
    setting_key   VARCHAR(50) NOT NULL UNIQUE,     -- Khóa cấu hình (viết hoa dạng SNAKE_CASE)
    setting_value NVARCHAR(255) NOT NULL,          -- Giá trị cấu hình (lưu dạng chuỗi để linh hoạt kiểu số/chữ)
    data_type     VARCHAR(20) NOT NULL DEFAULT 'STRING' 
                  CHECK (data_type IN ('INT', 'DECIMAL', 'STRING', 'BOOLEAN')), -- Kiểu dữ liệu để BE parse
    description   NVARCHAR(255) NULL,              -- Mô tả cho Thủ thư / Admin hiểu
    updated_at    DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE membership_plans (
    plan_id             TINYINT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(50) NOT NULL UNIQUE,   -- Tên gói (BASIC, STANDARD, PREMIUM)
    price               DECIMAL(12,2) NOT NULL DEFAULT 0, -- Giá gói (VNĐ)
    duration_days       INT NOT NULL DEFAULT 30,        -- Thời hạn gói (ngày, ví dụ: 30 ngày, 365 ngày)
    
    -- Các trường ưu đãi tiền cọc theo tài liệu nghiệp vụ
    deposit_discount_pct TINYINT NOT NULL DEFAULT 0 
                         CHECK (deposit_discount_pct BETWEEN 0 AND 100), -- % giảm tiền cọc (0 - 100%)
    max_deposit_amount   DECIMAL(12,2) NULL,            -- Mức cọc tối đa (dùng cho STANDARD: max 100.000đ)
    free_deposit_price_limit DECIMAL(12,2) NULL,        -- Miễn 100% cọc với sách có giá < mức này (Basic: 200k, Premium: 500k)
    
    description         NVARCHAR(500) NULL,             -- Quyền lợi mô tả hiển thị trên UI
    is_active           BIT NOT NULL DEFAULT 1,         -- 1: Đang bán/hiển thị, 0: Tạm ngưng
    created_at          DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME NULL
);

CREATE TABLE user_memberships (
    user_membership_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id            BIGINT NOT NULL,
    plan_id            TINYINT NOT NULL,
    
    start_date         DATETIME NOT NULL,
    end_date           DATETIME NOT NULL,
    
    -- Trạng thái: 1: ACTIVE (Đang dùng), 2: EXPIRED (Đã hết hạn), 3: CANCELLED
    status             TINYINT NOT NULL DEFAULT 1 CHECK (status IN (1,2,3)),
    
    created_at         DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_UserMemberships_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_UserMemberships_Plans FOREIGN KEY (plan_id) REFERENCES Membership_Plans(plan_id)
);

-- RESERVATIONS =====================================
CREATE TABLE reservations (
    reservation_id  BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,
  
    -- Trạng thái đơn đặt giữ:
    -- 0: PENDING (Chờ thủ thư duyệt)
    -- 1: APPROVED (Đã duyệt - bắt đầu giữ sách tối đa 3 ngày-> chuyển thành Temp BorrowRecord)
    -- 2: COMPLETED (Đã đến nhận sách)
    -- 3: CANCELLED (Độc giả hoặc thủ thư hủy)
    -- 4: REJECTED (Thủ thư từ chối)
    -- 5: EXPIRED (Quá 3 ngày không đến nhận -> Cron job nhả)
    status          TINYINT NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3,4,5)),
    
    approved_at     DATETIME NULL,                      -- Thời điểm thủ thư bấm duyệt
    expires_at      DATETIME NULL,                      -- approved_at + 3 ngày (dùng để quét Cron)
    note            NVARCHAR(255) NULL,                 -- Ghi chú/lý do từ chối
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME NULL,
    
    CONSTRAINT FK_Reservations_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
CREATE INDEX IX_Reservations_User ON Reservations(user_id);
CREATE INDEX IX_Reservations_Status_Expire ON Reservations(status, expires_at);


CREATE TABLE reservation_details (
    reservation_detail_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,

    CONSTRAINT FK_ReservationDetails_Reservations FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    CONSTRAINT FK_ReservationDetails_Books FOREIGN KEY (book_id) REFERENCES books(book_id),
    CONSTRAINT UQ_ReservationDetails UNIQUE (reservation_id, book_id)
);

-- BORROWING & RETURNING =================================
CREATE TABLE borrow_records (
    borrow_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,                    -- Độc giả mượn
    librarian_id    BIGINT NOT NULL,                    -- Thủ thư tạo phiếu tại quầy
    reservation_id  BIGINT NULL,                        -- Đơn đặt trước nếu có (từ UC-RES-07)
    
    borrow_date     DATETIME NOT NULL DEFAULT GETDATE(),
    due_date        DATETIME NOT NULL,                  -- Hạn trả (tính theo giá sách: 7/14/30 ngày)
    deposit_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,   -- Tiền cọc đã thu tại quầy
    
    extension_count TINYINT NOT NULL DEFAULT 0,         -- Số lần đã gia hạn (max 1 lần)
    
    -- Trạng thái phiếu:
    -- 0: PENDING (Chờ lấy và thanh toán)
    -- 1: BORROWING (Đang mượn)
    -- 2: RETURNED (Đã trả toàn bộ sách)
    -- 3: OVERDUE (Đang quá hạn chưa trả)
    -- 4: CANCELLED (Hủy phiếu)
    status          TINYINT NOT NULL DEFAULT 1 CHECK (status IN (0,1,2,3,4)),   
    -- Thêm trường trạng thái cọc vào Borrow_Records:
    -- deposit_status: 
    -- 0: NO_DEPOSIT (Không cần cọc / được miễn cọc theo Membership)
    -- 1: PAID (Đã thu cọc)
    -- 2: REFUNDED (Đã hoàn trả cọc khi trả sách)
    -- 3: UNPAID
    deposit_status TINYINT NOT NULL DEFAULT 0 CHECK (deposit_status IN (0, 1, 2, 3)),
    
    note            NVARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME NULL,
    
    CONSTRAINT FK_BorrowRecords_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_BorrowRecords_Librarians FOREIGN KEY (librarian_id) REFERENCES Users(user_id),
    CONSTRAINT FK_BorrowRecords_Reservations FOREIGN KEY (reservation_id) REFERENCES Reservations(reservation_id)
);

CREATE TABLE borrow_details (
    detail_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    borrow_id       BIGINT NOT NULL,
    copy_id         BIGINT NOT NULL,                    -- Mã cuốn sách vật lý (Book_Copies)
    status          BIT NOT NULL CHECK (status IN (0,1)),    --1: APPROVE, 0: REJECT
    return_date     DATETIME NULL,                      -- Ngày trả thực tế của cuốn này
    
    -- Tình trạng khi trả: 1: NORMAL (Bình thường), 2: DAMAGED (Hỏng), 3: LOST (Mất)
    return_status   TINYINT NULL CHECK (return_status IN (1,2,3)),
    note            NVARCHAR(255) NULL,
    
    CONSTRAINT FK_BorrowDetails_BorrowRecords FOREIGN KEY (borrow_id) REFERENCES Borrow_Records(borrow_id) ON DELETE CASCADE,
    CONSTRAINT FK_BorrowDetails_Copies FOREIGN KEY (copy_id) REFERENCES Book_Copies(copy_id)
);

-- FINES & PAYMENTS ===========================================
CREATE TABLE fines (
    fine_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    borrow_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    amount          DECIMAL(12,2) NOT NULL DEFAULT 0,   -- Số tiền phạt (cộng dồn bởi Cron hoặc chỉnh tay)
    copy_id BIGINT NULL, -- Nếu có sách bị hư, lỗi
    
    -- Lý do: 1: OVERDUE (Trễ hạn), 2: DAMAGED (Hỏng sách), 3: LOST (Làm mất)
    reason          TINYINT NOT NULL DEFAULT 1 CHECK (reason IN (1,2,3)),
    
    -- Trạng thái: 0: UNPAID, 1: PAID, 2: WAIVED (Được thủ thư/Admin miễn giảm)
    status          TINYINT NOT NULL DEFAULT 0 CHECK (status IN (0,1,2)),
    
    note            NVARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME NULL,
    
    CONSTRAINT FK_Fines_BorrowRecords FOREIGN KEY (borrow_id) REFERENCES Borrow_Records(borrow_id),
    CONSTRAINT FK_Fines_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Fines_BookCopies FOREIGN KEY (copy_id) REFERENCES book_copies(copy_id)
);

CREATE TABLE payments (
    payment_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    
    -- Loại giao dịch: 
    -- 1: FINE (Nộp phạt)
    -- 2: MEMBERSHIP (Mua gói)
    -- 3: DEPOSIT (Thu tiền cọc lúc mượn)
    -- 4: DEPOSIT_REFUND (Hoàn trả tiền cọc lúc trả sách)
    payment_type    TINYINT NOT NULL CHECK (payment_type IN (1, 2, 3, 4)),
    
    -- Khóa ngoại liên kết theo loại nghiệp vụ:
    borrow_id       BIGINT NULL,                        -- Dùng cho DEPOSIT hoặc DEPOSIT_REFUND
    fine_id         BIGINT NULL,                        -- Dùng cho FINE
    plan_id         TINYINT NULL,                       -- Dùng cho MEMBERSHIP
    
    amount          DECIMAL(12,2) NOT NULL,             -- Số tiền giao dịch
    
    -- Phương thức thanh toán: 1: CASH (Tiền mặt), 2: VNPAY, 3: PAYOS
    payment_method  TINYINT NOT NULL DEFAULT 1 CHECK (payment_method IN (1, 2, 3)),
    
    -- Dành cho VNPay / PayOS:
    txn_ref         VARCHAR(100) NOT NULL UNIQUE,       -- Mã đơn hàng gửi sang cổng
    gateway_txn_no  VARCHAR(100) NULL,                  -- Mã giao dịch VNPay trả về
    bank_code       VARCHAR(50)  NULL,
    
    -- Trạng thái: 0: PENDING, 1: SUCCESS, 2: FAILED, 3: CANCELLED
    status          TINYINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3)),
    
    note            NVARCHAR(255) NULL,                 -- Ghi chú (VD: "Hoàn cọc khi trả sách")
    paid_at         DATETIME NULL,                      -- Thời điểm thanh toán/hoàn tiền
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Payments_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Payments_BorrowRecords FOREIGN KEY (borrow_id) REFERENCES Borrow_Records(borrow_id),
    CONSTRAINT FK_Payments_Fines FOREIGN KEY (fine_id) REFERENCES Fines(fine_id),
    CONSTRAINT FK_Payments_Plans FOREIGN KEY (plan_id) REFERENCES Membership_Plans(plan_id)
);

-- BLACKLIST ===================================
CREATE TABLE blacklists (
    blacklist_id    BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    reason          NVARCHAR(255) NOT NULL,             -- Lý do (Ví dụ: "Nợ phạt > 100k quá 14 ngày")
    
    -- 1: AUTO_SYSTEM (Do Cron phát hiện), 2: MANUAL_LIBRARIAN (Thủ thư khóa tay)
    created_by_type TINYINT NOT NULL DEFAULT 1 CHECK (created_by_type IN (1,2)),
    created_by_user BIGINT NULL,                        -- ID Thủ thư nếu khóa tay
    
    is_active       BIT NOT NULL DEFAULT 1,             -- 1: Đang bị cấm, 0: Đã được mở khóa
    unlocked_at     DATETIME NULL,                      -- Ngày mở khóa
    unlocked_by     BIGINT NULL,                        -- ID Thủ thư/Admin mở khóa
    
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Blacklists_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Blacklists_Librarians FOREIGN KEY (created_by_user) REFERENCES Users(user_id),
    CONSTRAINT FK_Blacklists_UnlockedBy FOREIGN KEY (unlocked_by) REFERENCES Users(user_id)
);

CREATE TABLE notifications (
    notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           NVARCHAR(150) NOT NULL,
    
    -- Loại thông báo: 1: RESERVATION, 2: DUE_DATE_REMINDER, 3: OVERDUE, 4: PAYMENT, 5: MEMBERSHIP
    type            TINYINT NOT NULL DEFAULT 1 CHECK (type IN (1,2,3,4,5)),
    
    is_read         BIT NOT NULL DEFAULT 0,             -- 0: Chưa đọc, 1: Đã đọc
    read_at         DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);