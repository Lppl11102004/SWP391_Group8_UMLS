# 📚 HƯỚNG DẪN CÀI ĐẶT DỰ ÁN ULMS TỪ ĐẦU

### University Library Management System — Setup Guide

> **Dành cho:** Máy tính hoàn toàn mới, chưa cài bất kỳ phần mềm liên quan nào.  
> **Ngôn ngữ backend:** Java 21 + Spring Boot 4  
> **Ngôn ngữ frontend:** React 19 + Vite 8  
> **Cơ sở dữ liệu:** Microsoft SQL Server

---

## 📋 MỤC LỤC

1. [Yêu cầu phần mềm cần cài](#i-yêu-cầu-phần-mềm-cần-cài)
2. [Cấu trúc thư mục dự án](#ii-cấu-trúc-thư-mục-dự-án)
3. [Cài đặt & cấu hình Database](#iii-cài-đặt--cấu-hình-database-sql-server)
4. [Cấu hình Backend](#iv-cấu-hình-backend)
5. [Chạy Backend](#v-chạy-backend)
6. [Cài đặt & chạy Frontend](#vi-cài-đặt--chạy-frontend)
7. [Kiểm tra hệ thống hoạt động](#vii-kiểm-tra-hệ-thống-hoạt-động)
8. [Tài khoản test mặc định](#viii-tài-khoản-test-mặc-định)
9. [Xử lý lỗi thường gặp](#ix-xử-lý-lỗi-thường-gặp)

---

## I. YÊU CẦU PHẦN MỀM CẦN CÀI

Cài đặt **theo thứ tự** dưới đây trước khi tiến hành bất kỳ bước nào khác.

### 1. ☕ Java JDK 21 - Inteliji

| Thông tin   | Chi tiết                                                     |
| ----------- | ------------------------------------------------------------ |
| Phiên bản   | **JDK 21** (bắt buộc, không dùng phiên bản khác)             |
| Link tải    | https://adoptium.net/temurin/releases/?version=21            |
| Khuyến nghị | **Eclipse Temurin 21 (LTS)** — chọn Windows x64, dạng `.msi` |

**Cách cài đặt:**

1. Tải file `.msi` từ link trên
2. Chạy installer → nhấn **Next** → **Next** → **Install**
3. Trong quá trình cài, tích chọn **"Set JAVA_HOME variable"** và **"Add to PATH"**
4. Sau khi cài xong, mở **Command Prompt** và kiểm tra:
   ```cmd
   java -version
   ```
   Kết quả đúng sẽ có dạng:
   ```
   openjdk version "21.x.x" ...
   ```

> ⚠️ **Quan trọng:** Nếu không thấy tùy chọn "Set JAVA_HOME" trong installer, bạn phải cài thủ công (xem phần [Xử lý lỗi](#ix-xử-lý-lỗi-thường-gặp)).

---

### 2. 🟢 Node.js v22+ và npm

| Thông tin   | Chi tiết                                              |
| ----------- | ----------------------------------------------------- |
| Phiên bản   | **Node.js v22 LTS** hoặc mới hơn                      |
| Link tải    | https://nodejs.org/en/download                        |
| Khuyến nghị | Chọn **Windows Installer (.msi)** — phiên bản **LTS** |

**Cách cài đặt:**

1. Tải file `.msi` từ link trên
2. Chạy installer → **Next** → Next → tích **"Automatically install necessary tools"** → Install
3. Sau khi cài xong, mở **Command Prompt mới** và kiểm tra:
   ```cmd
   node -v
   npm -v
   ```
   Kết quả đúng:
   ```
   v22.x.x
   10.x.x
   ```

---

### 3. 🗄️ Microsoft SQL Server (Developer Edition - miễn phí)

| Thông tin | Chi tiết                                                        |
| --------- | --------------------------------------------------------------- |
| Phiên bản | SQL Server 2019 hoặc 2022 **Developer Edition**                 |
| Link tải  | https://www.microsoft.com/en-us/sql-server/sql-server-downloads |
| Ghi chú   | Kéo xuống phần "Developer" → Download now                       |

**Cách cài đặt:**

1. Tải file installer → Chạy
2. Chọn **"Basic"** installation type → Accept → chọn thư mục cài → Install
3. Ghi nhớ: **Instance Name** mặc định thường là `SQLEXPRESS`
4. Sau khi cài, kích hoạt xác thực SQL (SA account) — xem bước cấu hình bên dưới

---

### 4. 🖥️ SQL Server Management Studio (SSMS)

| Thông tin | Chi tiết                                               |
| --------- | ------------------------------------------------------ |
| Mục đích  | Công cụ giao diện để quản lý SQL Server, chạy file SQL |
| Link tải  | https://aka.ms/ssmsfullsetup                           |
| Ghi chú   | File khá nặng (~600MB), cài 1 lần dùng mãi             |

**Cài đặt:** Tải về → chạy → Next → Install (mặc định).

---

### 5. 🛠️ Công cụ lập trình (Tùy chọn, không bắt buộc)

- **IntelliJ IDEA Community** (miễn phí): https://www.jetbrains.com/idea/download/ — để xem/sửa backend
- **Visual Studio Code**: https://code.visualstudio.com/ — để xem/sửa frontend

---

## II. CẤU TRÚC THƯ MỤC DỰ ÁN

Sau khi nhận source code, giải nén vào ổ `D:\` sao cho cấu trúc như sau:

```
D:\Library\
├── ulms\                          ← Backend (Spring Boot)
│   ├── src\
│   ├── pom.xml
│   ├── mvnw.cmd                   ← Maven wrapper (dùng lệnh này thay mvn)
│   └── ...
├── frontend\                      ← Frontend (React + Vite)
│   ├── src\
│   ├── package.json
│   └── ...
├── ULMS.sql                       ← Script tạo database schema + dữ liệu mẫu
├── InsertULMS.sql                 ← Script chèn thêm dữ liệu
└── HUONG_DAN_CAI_DAT_DU_AN.md    ← File này
```

> ⚠️ **Quan trọng:** Giữ nguyên đường dẫn `D:\Library\` vì các lệnh trong hướng dẫn này dùng đường dẫn đó. Nếu bạn để ở ổ khác (ví dụ `C:\`) thì phải thay tương ứng trong tất cả lệnh.

---

## III. CÀI ĐẶT & CẤU HÌNH DATABASE (SQL SERVER)

### Bước 1: Bật SQL Server Authentication (Xác thực bằng tài khoản SA)

1. Mở **SSMS** → Kết nối tới server:
   - Server name: `.\SQLEXPRESS` (hoặc `localhost\SQLEXPRESS`)
   - Authentication: **Windows Authentication**
   - Nhấn **Connect**

2. Chuột phải vào tên server (thanh bên trái) → chọn **Properties**

3. Vào tab **Security** → Chọn **"SQL Server and Windows Authentication mode"** → OK

4. Mở rộng **Security** → **Logins** → Chuột phải vào **sa** → **Properties**:
   - Tab **General**: Đặt password mới (ví dụ: `123`) — hoặc dùng mật khẩu bạn muốn
   - Tab **Status**: Đổi **Login** từ `Disabled` → **Enabled** → OK

5. Chuột phải vào server → **Restart** để áp dụng thay đổi

### Bước 2: Bật TCP/IP Protocol

1. Mở **SQL Server Configuration Manager** (tìm trong Start menu)
2. Mở rộng **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**
3. Chuột phải **TCP/IP** → **Enable**
4. Chuột phải **TCP/IP** → **Properties** → Tab **IP Addresses**:
   - Kéo xuống **IPAll** → **TCP Port**: đặt thành `1433`
5. OK → Mở **SQL Server Services** → Chuột phải **SQL Server (SQLEXPRESS)** → **Restart**

### Bước 3: Tạo Database và Import Data

1. Trong **SSMS**, nhấn **New Query**

2. Chạy lệnh sau để tạo database:

   ```sql
   CREATE DATABASE ULMS;
   GO
   ```

3. Mở file `ULMS.sql`:
   - Menu **File** → **Open** → **File...** → chọn `D:\Library\ULMS.sql`
   - Nhấn **F5** (hoặc nút Execute) để chạy toàn bộ script

4. Nếu có file `InsertULMS.sql`, thực hiện tương tự:
   - **File** → **Open** → **File...** → chọn `D:\Library\InsertULMS.sql`
   - Nhấn **F5**

5. Kiểm tra dữ liệu:
   ```sql
   USE ULMS;
   SELECT COUNT(*) FROM [User];
   ```
   Phải trả về số > 0 (có dữ liệu mẫu).

---

## IV. CẤU HÌNH BACKEND

### Bước 1: Mở file cấu hình

Mở file tại đường dẫn:

```
D:\Library\ulms\src\main\resources\application.properties
```

Dùng Notepad, VS Code hoặc IntelliJ để chỉnh sửa.

### Bước 2: Cấu hình kết nối Database

Tìm dòng sau và **sửa lại** theo máy của bạn:

```properties
spring.datasource.url=jdbc:sqlserver://TEN_MAY_TINH;instanceName=SQLEXPRESS;databaseName=ULMS;encrypt=true;trustServerCertificate=true;sendStringParametersAsUnicode=true
spring.datasource.username=sa
spring.datasource.password=MAT_KHAU_CUA_BAN
```

**Thay thế:**

- `TEN_MAY_TINH` → Tên máy tính của bạn. Lấy tên bằng cách mở CMD và gõ: `hostname`
  - Ví dụ: nếu `hostname` trả về `LAPTOP-ABC123` thì URL sẽ là `jdbc:sqlserver://LAPTOP-ABC123;instanceName=SQLEXPRESS;...`
  - Hoặc dùng `localhost` thay cho tên máy: `jdbc:sqlserver://localhost;instanceName=SQLEXPRESS;...`
- `MAT_KHAU_CUA_BAN` → Mật khẩu bạn đã đặt cho tài khoản SA ở bước trên

**Ví dụ hoàn chỉnh:**

```properties
spring.datasource.url=jdbc:sqlserver://localhost;instanceName=SQLEXPRESS;databaseName=ULMS;encrypt=true;trustServerCertificate=true;sendStringParametersAsUnicode=true
spring.datasource.username=sa
spring.datasource.password=123
```

### Bước 3: Các cấu hình khác (Giữ nguyên nếu không đổi)

Các thông tin sau đã được cấu hình sẵn, không cần sửa:

```properties
# VNPay (Sandbox - môi trường test, không mất tiền thật)
vnpay.tmn-code=O6EAPXE1
vnpay.hash-secret=DESVCUULYFFYEUIIRHRYDXVLYVJKTVFI

# Cloudinary (lưu trữ ảnh avatar)
cloudinary.cloud-name=nvmsmo6e
cloudinary.api-key=585157937571223
cloudinary.api-secret=4gc4zM1ycCRFRUFe1sUH-l0m124

# Google OAuth2
google.client-id=941993683678-dt4n7voum0li8te1g40tib57p8v683gs.apps.googleusercontent.com
```

---

## V. CHẠY BACKEND

### Cách 1: Chạy trực tiếp bằng Maven Wrapper (Khuyến nghị)

Mở **Command Prompt** (hoặc PowerShell) và gõ lần lượt:

```cmd
cd D:\Library\ulms
mvnw.cmd spring-boot:run
```

> ⏳ **Lần đầu chạy** sẽ mất 3–10 phút để tải dependencies từ internet. Các lần sau sẽ nhanh hơn.

**Hệ thống khởi động thành công** khi bạn thấy dòng:

```
Started UlmsApplication in X.XXX seconds
```

Backend đang chạy tại: **http://localhost:8080**

---

### Cách 2: Build thành file JAR rồi chạy

```cmd
cd D:\Library\ulms
mvnw.cmd clean package -DskipTests
java -jar target\ulms-0.0.1-SNAPSHOT.jar
```

> 💡 Dùng cách này khi muốn đóng gói để deploy hoặc khi Cách 1 bị lỗi.

---

### Cách 3: Chạy bằng IntelliJ IDEA

1. Mở IntelliJ → **File** → **Open** → chọn thư mục `D:\Library\ulms`
2. Chờ IntelliJ load project (thanh tiến trình phía dưới)
3. Mở file `src/main/java/com/ulms/UlmsApplication.java`
4. Nhấn nút ▶️ (Run) màu xanh bên cạnh class `UlmsApplication`

---

## VI. CÀI ĐẶT & CHẠY FRONTEND

Mở **Command Prompt mới** (không đóng cửa sổ đang chạy backend):

### Bước 1: Cài dependencies

```cmd
cd D:\Library\frontend
npm install
```

> ⏳ Lần đầu chạy `npm install` mất 2–5 phút để tải packages. Các lần sau dùng lại cache nên nhanh hơn.

### Bước 2: Chạy Frontend (chế độ Development)

```cmd
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

Mở trình duyệt và truy cập địa chỉ này.

---

### Lưu ý về cổng (Port)

| Dịch vụ        | URL mặc định          |
| -------------- | --------------------- |
| Backend API    | http://localhost:8080 |
| Frontend (dev) | http://localhost:5173 |

> ⚠️ **Đảm bảo cả hai cửa sổ Command Prompt đều đang chạy** (một cho backend, một cho frontend) trước khi dùng ứng dụng.

---

## VII. KIỂM TRA HỆ THỐNG HOẠT ĐỘNG

### Kiểm tra Backend:

Mở trình duyệt và truy cập:

```
http://localhost:8080/ulms/api/books
```

Kết quả đúng: Trả về JSON (có thể là `[]` nếu chưa có sách, hoặc danh sách sách)

### Kiểm tra Frontend:

Truy cập: **http://localhost:5173**

Trang đăng nhập phải hiện ra bình thường.

### Kiểm tra Kết nối DB:

Đăng nhập với tài khoản test (xem bên dưới) → Nếu đăng nhập thành công tức DB đã kết nối đúng.

---

## VIII. TÀI KHOẢN TEST MẶC ĐỊNH

| Vai trò                  | Email                 | Mật khẩu |
| ------------------------ | --------------------- | -------- |
| 👤 Reader (Độc giả)      | `reader@gmail.com`    | `123456` |
| 📚 Librarian (Thủ thư)   | `librarian@gmail.com` | `123456` |
| ⚙️ Admin (Quản trị viên) | `admin@gmail.com`     | `123456` |

### Luồng kiểm tra nhanh:

1. **Đăng nhập** với tài khoản Reader → Xem danh sách sách, tạo ticket mượn sách
2. **Đăng nhập** với tài khoản Librarian → Xác nhận ticket, bàn giao sách
3. **Đăng nhập** với tài khoản Admin → Quản lý người dùng, sách, báo cáo

---

## IX. XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: `JAVA_HOME is not set` hoặc `java is not recognized`

**Nguyên nhân:** Java chưa được thêm vào PATH hoặc JAVA_HOME chưa được đặt.

**Cách sửa:**

1. Nhấn `Windows + R` → gõ `sysdm.cpl` → Enter
2. Vào tab **Advanced** → **Environment Variables**
3. Trong **System variables**, nhấn **New**:
   - Variable name: `JAVA_HOME`
   - Variable value: Đường dẫn tới thư mục JDK (ví dụ: `C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot`)
4. Tìm biến `Path` → Edit → **New** → thêm `%JAVA_HOME%\bin`
5. Nhấn OK → **Mở lại Command Prompt mới** → Kiểm tra lại `java -version`

---

### ❌ Lỗi: `Connection refused` hoặc `Cannot connect to SQL Server`

**Nguyên nhân có thể:**

1. SQL Server chưa chạy
2. TCP/IP chưa được bật
3. Sai tên máy trong connection string

**Cách sửa:**

1. Mở **Services** (nhấn `Windows + R` → `services.msc`) → Tìm **SQL Server (SQLEXPRESS)** → Start
2. Kiểm tra lại TCP/IP đã bật chưa (xem Bước 2 phần III)
3. Thử đổi tên máy trong `application.properties` thành `localhost`:
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost;instanceName=SQLEXPRESS;databaseName=ULMS;...
   ```
4. Kiểm tra tên instance: Trong SSMS, tên instance thường hiện ở thanh tiêu đề, ví dụ `DESKTOP-ABC\SQLEXPRESS`

---

### ❌ Lỗi: `Login failed for user 'sa'`

**Nguyên nhân:** Tài khoản SA bị tắt hoặc sai mật khẩu.

**Cách sửa:**

1. Kết nối vào SSMS bằng **Windows Authentication**
2. Vào Security → Logins → sa → Properties
3. Đặt lại mật khẩu và bật Login (xem Bước 1 phần III)

---

### ❌ Lỗi: `Port 8080 already in use`

**Nguyên nhân:** Có ứng dụng khác đang dùng cổng 8080.

**Cách sửa:**

```cmd
netstat -ano | findstr :8080
```

Ghi lại số PID ở cột cuối, sau đó:

```cmd
taskkill /PID <số_pid> /F
```

Hoặc đổi port backend: Trong `application.properties` thêm dòng:

```properties
server.port=8081
```

(Nhớ cập nhật lại trong frontend nếu đổi port backend)

---

### ❌ Lỗi: `npm install` thất bại

**Cách sửa:**

```cmd
cd D:\Library\frontend
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

---

### ❌ Lỗi: `Schema validation failed` khi chạy backend

**Nguyên nhân:** Database chưa có đầy đủ bảng hoặc cột.

**Cách sửa:** Chạy lại file `ULMS.sql` trong SSMS (xem Bước 3 phần III). Đảm bảo không có lỗi nào trong quá trình chạy script.

---

### ❌ Lỗi: Frontend mở được nhưng đăng nhập không được / API lỗi CORS

**Nguyên nhân:** Backend chưa chạy hoặc chạy ở port khác.

**Cách sửa:**

1. Kiểm tra backend đang chạy ở port 8080: http://localhost:8080/ulms/api/books
2. Nếu backend ở port khác, mở file `D:\Library\frontend\src\api\axios.js` (hoặc file config tương tự) và sửa lại URL

---

## 📌 TÓM TẮT CÁC LỆNH THƯỜNG DÙNG

```cmd
# ======= BACKEND =======
cd D:\Library\ulms

# Chạy backend (Development)
mvnw.cmd spring-boot:run

# Build & chạy (Production)
mvnw.cmd clean package -DskipTests
java -jar target\ulms-0.0.1-SNAPSHOT.jar

# ======= FRONTEND =======
cd D:\Library\frontend

# Cài dependencies (chỉ cần làm 1 lần)
npm install

# Chạy frontend (Development)
npm run dev

# ======= DATABASE =======
# Kiểm tra SQL Server đang chạy
sc query MSSQL$SQLEXPRESS
```

---

## 📞 Nếu vẫn gặp vấn đề

Gửi thông báo lỗi (copy toàn bộ text đỏ trong console) cho người phát triển để được hỗ trợ.

---

_Tài liệu cập nhật lần cuối: Tháng 10/2026_  
_Dự án: ULMS — University Library Management System_
