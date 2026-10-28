USE ULMS;
GO

-- ====================================================================
-- 1. ROLES
-- ====================================================================
INSERT INTO roles (role_id, role_name, description) VALUES
 (1, 'READER',    N'Độc giả thư viện'),
 (2, 'LIBRARIAN', N'Thủ thư quản lý mượn trả & kho sách'),
 (3, 'ADMIN',     N'Quản trị viên toàn hệ thống');
GO

-- ====================================================================
-- 2. USERS (Mật khẩu mặc định: 123456)
-- Hash BCrypt: $2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu
-- ====================================================================
INSERT INTO users (full_name, email, password_hash, phone, avatar_url, address, role_id, status) VALUES
(N'Nguyễn Văn An',   'reader@gmail.com',    '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0901234567', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', N'Hải Châu, Đà Nẵng', 1, 1),
(N'Trần Thị Bình',   'librarian@gmail.com', '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0912345678', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', N'Hội An, Quảng Nam', 2, 1),
(N'Lê Văn Cường',    'admin@gmail.com',     '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0923456789', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200', N'Tam Kỳ, Quảng Nam', 3, 1),
(N'Lê Hoàng Nam',    'reader2@gmail.com',   '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0934567890', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', N'Sơn Trà, Đà Nẵng', 1, 1),
(N'Phạm Thị Mai',    'reader3@gmail.com',   '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0945678901', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', N'Ngũ Hành Sơn, Đà Nẵng', 1, 1),
(N'Trần Quang Huy',  'reader4@gmail.com',   '$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0956789012', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', N'Thanh Khê, Đà Nẵng', 1, 1),
(N'Vũ Thị Thảo',     'librarian2@gmail.com','$2a$10$lWcWLApgKv.eVGYlMHjlCucBF2ZLYgoRhCbyCqzZvQ2MgA/NVQ/xu', '0967890123', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', N'Cẩm Lệ, Đà Nẵng', 2, 1);
GO

-- ====================================================================
-- 3. AUTHORS (Kèm avatar_url chân dung tác giả)
-- ====================================================================
INSERT INTO authors (name, bio, avatar_url) VALUES
(N'Nguyễn Nhật Ánh',     N'Nhà văn Việt Nam nổi tiếng với các tác phẩm dành cho tuổi mới lớn như Mắt Biếc, Tôi Thấy Hoa Vàng Trên Cỏ Xanh.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334049/acb6bd13-4054-4104-b44f-79a76be5dec0.png'),
(N'Nam Cao',             N'Nhà văn hiện thực xuất sắc của văn học Việt Nam thế kỷ 20, tác giả của Chí Phèo, Lão Hạc, Sống Mòn.',             'https://res.cloudinary.com/dkumap602/image/upload/v1792334099/75b74918-4ee2-442f-943a-5d48764efd8b.png'),
(N'Tô Hoài',             N'Nhà văn Việt Nam với hơn 60 năm sáng tác, nổi tiếng với kiệt tác Dế Mèn Phiêu Lưu Ký và Vợ Chồng A Phủ.',        'https://res.cloudinary.com/dkumap602/image/upload/v1792334124/86a7af79-7313-4bef-8a94-7b611a5d1ced.png'),
(N'Robert C. Martin',     N'Chuyên gia kiến trúc phần mềm, thường được gọi là "Uncle Bob", tác giả Clean Code và Agile Principles.',           'https://res.cloudinary.com/dkumap602/image/upload/v1792334164/1472fcd2-4de2-4b9a-8658-3beb8755c396.png'),
(N'Joshua Bloch',         N'Kỹ sư phần mềm xuất chúng, cựu kiến trúc sư trưởng Java tại Sun Microsystems, tác giả Effective Java.',            'https://res.cloudinary.com/dkumap602/image/upload/v1792334198/2f716461-0580-4ad8-9015-217ad9e3465d.png'),
(N'Martin Fowler',        N'Nhà khoa học máy tính và tác giả nổi tiếng quốc tế trong lĩnh vực Software Architecture, Microservices và Refactoring.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334226/4800d9a1-9240-48d4-bb2d-14117d375947.png'),
(N'Andrew S. Tanenbaum',  N'Giáo sư khoa học máy tính tại Vrije Universiteit Amsterdam, tác giả hệ điều hành MINIX và giáo trình mạng máy tính.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334261/26985d3e-694b-4afe-903d-ec7d10d9b3cf.png'),
(N'Abraham Silberschatz', N'Giáo sư khoa học máy tính tại Đại học Yale, tác giả kinh điển của Database System Concepts và Operating System Concepts.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334298/eb4ae5bd-71a9-4a4b-bbb5-369119bd8709.png'),
(N'Dale Carnegie',        N'Nhà văn, diễn giả người Mỹ nổi tiếng thế giới, tác giả của Đắc Nhân Tâm (How to Win Friends and Influence People).',  'https://res.cloudinary.com/dkumap602/image/upload/v1792334325/6970362a-4adc-4c80-a5a8-d6ea06bc62ea.png'),
(N'Brian W. Kernighan',   N'Nhà khoa học máy tính tiên phong tại Bell Labs, đồng tác giả ngôn ngữ lập trình AWK và cuốn sách The C Programming Language.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334364/f7f0bead-0676-416c-8d3e-330eb1f66adb.png'),
(N'Eric Evans',           N'Nhà tư vấn kiến trúc phần mềm, người đặt nền móng cho phương pháp Domain-Driven Design (DDD).',                    'https://res.cloudinary.com/dkumap602/image/upload/v1792334391/5e83347f-8591-4299-9b44-ff349c6cdb63.png'),
(N'Yuval Noah Harari',    N'Nhà sử học, triết gia và giáo sư tại Đại học Hebrew Jerusalem, tác giả bộ sách Sapiens, Homo Deus và 21 Bài Học.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792334423/7459bdd7-a8b8-4689-a2fc-493373db3859.png');
GO

-- ====================================================================
-- 4. CATEGORIES
-- ====================================================================
INSERT INTO categories (name, description) VALUES
(N'Lập trình',               N'Sách về lập trình, ngôn ngữ lập trình và kỹ thuật phát triển phần mềm.'),
(N'Công nghệ thông tin',     N'Sách về công nghệ thông tin, máy tính và các công nghệ hiện đại.'),
(N'Cơ sở dữ liệu',           N'Sách về cơ sở dữ liệu, SQL, hệ quản trị cơ sở dữ liệu và thiết kế dữ liệu.'),
(N'Mạng máy tính',           N'Sách về mạng máy tính, giao thức mạng và an toàn thông tin.'),
(N'Hệ điều hành',            N'Sách về hệ điều hành, quản lý tài nguyên và kiến trúc hệ thống.'),
(N'Khoa học',                N'Sách về khoa học tự nhiên, khoa học ứng dụng và nghiên cứu.'),
(N'Kinh tế & Quản trị',      N'Sách về kinh tế, tài chính, khởi nghiệp và kỹ năng quản trị kinh doanh.'),
(N'Văn học Việt Nam',        N'Các tác phẩm văn học, tiểu thuyết và truyện ngắn của tác giả Việt Nam.'),
(N'Văn học nước ngoài',      N'Các tác phẩm văn học, tiểu thuyết kinh điển của các tác giả thế giới.'),
(N'Truyện thiếu nhi',        N'Sách và truyện tranh giáo dục, phiêu lưu dành cho thiếu niên, nhi đồng.'),
(N'Kỹ năng sống',            N'Sách phát triển bản thân, kỹ năng giao tiếp, tâm lý học ứng dụng.'),
(N'Trí tuệ nhân tạo (AI)',   N'Sách về Machine Learning, Deep Learning, Data Science và Generative AI.');
GO

-- ====================================================================
-- 5. PUBLISHERS
-- ====================================================================
INSERT INTO publishers (name, address) VALUES
(N'Nhà Xuất Bản Giáo Dục Việt Nam',             N'81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'),
(N'Nhà Xuất Bản Kim Đồng',                     N'55 Quang Trung, Hai Bà Trưng, Hà Nội'),
(N'Nhà Xuất Bản Trẻ',                          N'161B Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh'),
(N'Nhà Xuất Bản Văn Học',                      N'18 Nguyễn Trường Tộ, Ba Đình, Hà Nội'),
(N'Nhà Xuất Bản Thông Tin và Truyền Thông',     N'18 Nguyễn Du, Hai Bà Trưng, Hà Nội'),
(N'Nhà Xuất Bản Khoa Học và Kỹ Thuật',         N'70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'),
(N'Penguin Random House',                      N'1745 Broadway, New York, USA'),
(N'O''Reilly Media',                           N'1005 Gravenstein Highway North, Sebastopol, California, USA'),
(N'Pearson Education',                         N'80 Strand, London, United Kingdom'),
(N'Springer',                                  N'Gewerbestrasse 11, Cham, Switzerland'),
(N'Nhà Xuất Bản Tổng Hợp TP.HCM',              N'62 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh'),
(N'Addison-Wesley Professional',               N'Boston, Massachusetts, USA');
GO

-- ====================================================================
-- 6. BOOKS
-- ====================================================================
INSERT INTO books (title, isbn, price, author_id, category_id, publisher_id, published_year, description, cover_image_url) VALUES
(N'Clean Code: A Handbook of Agile Software Craftsmanship', '9780132350884', 250000, 4, 1, 9, 2008, N'Sách kinh điển hướng dẫn các nguyên tắc và kỹ thuật viết mã nguồn sạch, dễ đọc và dễ bảo trì trong ngành phần mềm.', 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912565/clean-code.jpg'),
(N'Effective Java (3rd Edition)',                           '9780134685991', 300000, 5, 1, 9, 2018, N'Cung cấp 90 điều đúc kết và nguyên tắc tốt nhất khi lập trình ứng dụng chuyên nghiệp bằng ngôn ngữ Java.',     'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/EffectiveJava.jpg'),
(N'Refactoring: Improving the Design of Existing Code',      '9780134757599', 350000, 6, 1, 9, 2018, N'Giới thiệu nguyên lý tái cấu trúc mã nguồn một cách có hệ thống mà không làm thay đổi hành vi bên ngoài của phần mềm.', 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/Refactoring.jpg'),
(N'Operating System Concepts (10th Edition)',               '9781119800361', 400000, 8, 5, 9, 2021, N'Giáo trình đại học chuẩn quốc tế về các nguyên lý cốt lõi, quản lý tiến trình, bộ nhớ và hệ thống tệp trong OS.', 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/Operating_System_Concepts.jpg'),
(N'Computer Networks (5th Edition)',                        '9780132126953', 450000, 7, 4, 9, 2010, N'Tài liệu toàn diện về kiến trúc mạng máy tính, mô hình OSI, TCP/IP, giao thức định tuyến và bảo mật mạng.',   'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/Computer_Networks.webp'),
(N'Dế Mèn Phiêu Lưu Ký',                                    '9786042112345', 120000, 3, 10, 2, 1941, N'Tác phẩm văn học thiếu nhi bất hủ của nhà văn Tô Hoài kể về bài học trưởng thành và cuộc phiêu lưu của chú Dế Mèn.', 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/D%E1%BA%BF_M%C3%A8n_Phi%C3%AAu_L%C6%B0u_K%C3%BD.webp'),
(N'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',                         '9786041123456', 150000, 1, 8, 3, 2010, N'Tác phẩm trong trẻo về tuổi thơ làng quê nghèo miền Trung, tình anh em ruột thịt và những rung động đầu đời.', 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/T%C3%B4i_Th%E1%BA%A5y_Hoa_V%C3%A0ng_Tr%C3%AAn_C%E1%BB%8F_Xanh.webp'),
(N'Cho Tôi Xin Một Vé Đi Tuổi Thơ',                         '9786042234567', 130000, 1, 8, 3, 2008, N'Tác phẩm đưa người lớn trở về thế giới tuổi thơ vô tư, ngây ngô và đầy sáng tạo của nhóm bạn Cu Mùi.',           'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/Cho_T%C3%B4i_Xin_M%E1%BB%99t_V%C3%A9_%C4%90i_Tu%E1%BB%95i_Th%C6%A1.webp'),
(N'Chí Phèo & Tuyển Tập Truyện Ngắn Nam Cao',               '9786040182736', 110000, 2, 8, 4, 1941, N'Bức tranh hiện thực sắc nét về nỗi đau và khát vọng làm người lương thiện của người nông dân Việt Nam trước năm 1945.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335739/a373ad05-f364-42cb-b081-335de2480df0.png'),
(N'Domain-Driven Design: Tackling Complexity in Software',   '9780321125217', 480000, 11, 1, 12, 2003, N'Cuốn sách kinh điển của Eric Evans hướng dẫn cách gắn kết chặt chẽ thiết kế phần mềm với miền nghiệp vụ thực tế.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335680/d34a4621-2899-46cf-95da-3ffb34e37fe8.png'),
(N'The C Programming Language (2nd Edition)',               '9780131103627', 280000, 10, 1, 9, 1988, N'Kinh thánh về ngôn ngữ C được chắp bút bởi chính Brian Kernighan và Dennis Ritchie - cha đẻ của hệ điều hành UNIX.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335774/ee99f63e-b5e9-4e64-a67f-b6780f980fbc.png'),
(N'Đắc Nhân Tâm - How To Win Friends and Influence People', '9786045882894', 120000, 9, 11, 11, 1936, N'Cuốn sách nghệ thuật thu phục lòng người và xây dựng mối quan hệ xã hội được đón đọc nhiều nhất mọi thời đại.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335800/03166386-5001-4e68-996d-b3b46c81fbfa.png'),
(N'Sapiens: Lược Sử Loài Người',                            '9786045638286', 220000, 12, 6, 3, 2014, N'Hành trình kỳ vĩ tái hiện toàn bộ tiến trình lịch sử tiến hóa của giống loài Homo sapiens từ thuở hồng hoang đến hiện đại.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335825/030e82e4-7eee-4413-8cb9-650cbc4dc1dc.png'),
(N'Modern Operating Systems (4th Edition)',                 '9780133591620', 420000, 7, 5, 9, 2014, N'Phân tích chuyên sâu về ảo hóa, đa luồng, bảo mật và kiến trúc các hệ điều hành hiện đại Linux, Windows, Android.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335848/a1980acc-ab18-4880-8621-0acaaf529304.png'),
(N'Database System Concepts (7th Edition)',                 '9780078022159', 430000, 8, 3, 10, 2019, N'Giáo trình chuẩn toàn cầu về mô hình cơ sở dữ liệu quan hệ, SQL nâng cao, giao dịch ACID và hệ phân tán NoSQL.', 'https://res.cloudinary.com/dkumap602/image/upload/v1792335877/f2ad7774-1da2-4f9a-b6d3-2a920ada0138.png');
GO

-- ====================================================================
-- 7. BOOK IMAGES (Hình ảnh chi tiết các trang / góc chụp sách)
-- ====================================================================
INSERT INTO book_images (book_id, image_url) VALUES
(1, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912565/clean-code.jpg'),
(1, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912565/clean-code.jpg'),
(2, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/EffectiveJava.jpg'),
(2, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/EffectiveJava.jpg'),
(3, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/Refactoring.jpg'),
(3, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912564/Refactoring.jpg'),
(7, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/T%C3%B4i_Th%E1%BA%A5y_Hoa_V%C3%A0ng_Tr%C3%AAn_C%E1%BB%8F_Xanh.webp'),
(8, 'https://res.cloudinary.com/gbsav6cc/image/upload/v1791912563/Cho_T%C3%B4i_Xin_M%E1%BB%99t_V%C3%A9_%C4%90i_Tu%E1%BB%95i_Th%C6%A1.webp'),
(12, 'https://res.cloudinary.com/dkumap602/image/upload/v1792335800/03166386-5001-4e68-996d-b3b46c81fbfa.png');
GO

-- ====================================================================
-- 8. E-BOOKS
-- ====================================================================
INSERT INTO e_books (book_id, file_url, file_size_kb, total_pages) VALUES 
(1,  'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335000/ulms/ebooks/cduu2ah7zeucvpvat1bm', 464, 10),
(2,  'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335463/ulms/ebooks/cvopfihdqyejbfwehixp', 464, 10),
(3,  'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335188/ulms/ebooks/e53suefbhut5auzusuiz', 412, 10),
(8, 'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335378/ulms/ebooks/aorctpexzgav3snplpkk', 320, 10),
(9,  'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335287/ulms/ebooks/iucwrln0qxg7nkexsosg', 448, 10),
(12,  'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335335/ulms/ebooks/iqqlpx9tzwls8zbqcesh', 378, 10),
(15, 'https://res.cloudinary.com/nvmsmo6e/raw/upload/v1792335541/ulms/ebooks/rd0zcmexwucllyrozuju', 320, 10);
GO

-- ====================================================================
-- 9. BOOK COPIES (Bản sao sách vật lý: 1=AVAILABLE, 2=BORROWED, 3=DAMAGED, 4=LOST)
-- ====================================================================
INSERT INTO book_copies (book_id, barcode, status) VALUES
-- Clean Code
(1, 'CC-0001', 1),
(1, 'CC-0002', 1),
(1, 'CC-0003', 2),
(1, 'CC-0004', 1),
-- Effective Java
(2, 'EJ-0001', 1),
(2, 'EJ-0002', 2),
(2, 'EJ-0003', 1),
-- Refactoring
(3, 'RF-0001', 1),
(3, 'RF-0002', 3),
(3, 'RF-0003', 1),
-- Operating System Concepts
(4, 'OSC-0001', 1),
(4, 'OSC-0002', 1),
(4, 'OSC-0003', 4),
-- Computer Networks
(5, 'CN-0001', 1),
(5, 'CN-0002', 2),
-- Dế Mèn Phiêu Lưu Ký
(6, 'DM-0001', 1),
(6, 'DM-0002', 1),
(6, 'DM-0003', 1),
-- Tôi Thấy Hoa Vàng Trên Cỏ Xanh
(7, 'THV-0001', 1),
(7, 'THV-0002', 2),
-- Cho Tôi Xin Một Vé Đi Tuổi Thơ
(8, 'VTV-0001', 1),
(8, 'VTV-0002', 1),
-- Chí Phèo
(9, 'CP-0001', 1),
(9, 'CP-0002', 1),
-- Domain-Driven Design
(10, 'DDD-0001', 1),
(10, 'DDD-0002', 2),
-- The C Programming Language
(11, 'TCPL-0001', 1),
(11, 'TCPL-0002', 1),
-- Đắc Nhân Tâm
(12, 'DNT-0001', 1),
(12, 'DNT-0002', 1),
(12, 'DNT-0003', 2),
-- Sapiens
(13, 'SAP-0001', 1),
(13, 'SAP-0002', 1),
-- Modern Operating Systems
(14, 'MOS-0001', 1),
-- Database System Concepts
(15, 'DSC-0001', 1),
(15, 'DSC-0002', 1);
GO

-- ====================================================================
-- 10. REVIEWS (Đánh giá từ độc giả)
-- ====================================================================
INSERT INTO reviews (book_id, user_id, rating, comment, status) VALUES
(1, 1, 5, N'Sách gối đầu giường của mọi lập trình viên. Các nguyên tắc viết hàm ngắn và đặt tên biến rất thực tế!', 1),
(1, 4, 5, N'Nội dung rất sâu sắc, thay đổi hoàn toàn tư duy viết code sạch của mình.', 1),
(2, 1, 5, N'Từng item trong Effective Java đều đáng giá ngàn vàng cho các bạn theo hướng Java backend.', 1),
(3, 4, 4, N'Sách giải thích các pattern tái cấu trúc rất tỉ mỉ, có ví dụ cụ thể.', 1),
(7, 1, 5, N'Đọc lại lần thứ ba vẫn thấy xúc động, văn phong Nguyễn Nhật Ánh thật mộc mạc và chân thành.', 1),
(7, 5, 5, N'Một cuốn sách tuyệt vời về tình anh em và tuổi thơ làng quê.', 1),
(12, 5, 5, N'Cuốn sách kỹ năng sống kinh điển, bất kỳ ai cũng nên đọc ít nhất một lần trong đời.', 1),
(6, 4, 5, N'Kiệt tác thiếu nhi của Việt Nam, bản in chất lượng cao rất đáng đọc.', 1);
GO

-- ====================================================================
-- 11. E-BOOK READING PROGRESS (Tiến độ đọc E-Book)
-- ====================================================================
INSERT INTO ebook_reading_progress (user_id, ebook_id, current_page, last_read_at) VALUES
(1, 1, 128, DATEADD(hour, -2, GETDATE())),
(1, 4, 65,  DATEADD(day, -1, GETDATE())),
(4, 2, 42,  DATEADD(hour, -5, GETDATE()));
GO

-- ====================================================================
-- 12. BORROW CART (Giỏ sách tạm của độc giả)
-- ====================================================================
INSERT INTO borrow_cart (user_id, book_id, created_at) VALUES
(4, 10, DATEADD(minute, -30, GETDATE())),
(5, 1,  DATEADD(hour, -1, GETDATE())),
(5, 13, DATEADD(hour, -1, GETDATE()));
GO

-- ====================================================================
-- 13. SETTINGS (Cấu hình hệ thống thư viện)
-- ====================================================================
INSERT INTO settings (setting_key, setting_value, data_type, description) VALUES
('FINE_PER_DAY',                 '5000',   'DECIMAL', N'Mức phạt trễ hạn tính theo ngày cho mỗi cuốn sách (VNĐ)'),
('RESERVATION_HOLD_DAYS',        '3',      'INT',     N'Số ngày tối đa giữ sách cho độc giả sau khi duyệt đơn reservation'),
('MAX_EXTENSION_COUNT',          '1',      'INT',     N'Số lần tối đa độc giả được phép tự gia hạn một phiếu mượn online'),
('EXTENSION_DAYS',              '7',      'INT',     N'Số ngày được cộng thêm khi gia hạn mượn sách thành công'),
('BLACKLIST_OVERDUE_DAYS_LIMIT', '14',     'INT',     N'Số ngày quá hạn mượn sách để Cron job tự động đưa độc giả vào Blacklist'),
('BLACKLIST_FINE_LIMIT',         '100000', 'DECIMAL', N'Ngưỡng nợ phạt quá hạn chưa trả để kích hoạt Blacklist (VNĐ)'),
('MAX_BORROW_BOOKS_LIMIT',       '5',      'INT',     N'Số lượng bản sao sách tối đa một độc giả được mượn cùng lúc');
GO

-- ====================================================================
-- 14. MEMBERSHIP PLANS (Các gói hội viên)
-- ====================================================================
INSERT INTO membership_plans (name, price, duration_days, deposit_discount_pct, max_deposit_amount, free_deposit_price_limit, description, is_active) VALUES
(
    N'BASIC', 
    50000, 
    30, 
    0,      -- Không giảm % cọc chung
    NULL,   -- Không giới hạn trần
    200000, -- Miễn 100% tiền cọc cho sách có giá < 200.000đ
    N'Gói cơ bản (30 ngày): Miễn 100% tiền cọc cho sách dưới 200.000đ. Đọc E-Book online không giới hạn.', 
    1
),
(
    N'STANDARD', 
    120000, 
    90, 
    50,     -- Giảm 50% tiền cọc
    100000, -- Tiền cọc sách > 500.000đ tối đa 100.000đ
    NULL, 
    N'Gói tiêu chuẩn (90 ngày): Giảm 50% tiền cọc cho mọi loại sách (sách đắt tiền cọc tối đa 100.000đ). Đọc E-Book online.', 
    1
),
(
    N'PREMIUM', 
    300000, 
    365, 
    100,    -- Ưu đãi cao nhất: miễn cọc 100% cho sách < 500.000đ
    NULL, 
    500000, 
    N'Gói cao cấp (1 năm): Miễn 100% tiền cọc cho sách dưới 500.000đ. Đọc toàn bộ kho E-Book online không giới hạn và ưu tiên giữ chỗ.', 
    1
);
GO

-- ====================================================================
-- 15. USER MEMBERSHIPS (Gói hội viên của người dùng)
-- ====================================================================
INSERT INTO user_memberships (user_id, plan_id, start_date, end_date, status, created_at) VALUES
(1, 3, DATEADD(month, -1, GETDATE()), DATEADD(month, 11, GETDATE()), 1, DATEADD(month, -1, GETDATE())), -- User 1: Gói PREMIUM đang hoạt động
(4, 2, DATEADD(day, -20, GETDATE()),  DATEADD(day, 70, GETDATE()),   1, DATEADD(day, -20, GETDATE())),  -- User 4: Gói STANDARD đang hoạt động
(6, 1, DATEADD(month, -3, GETDATE()), DATEADD(month, -2, GETDATE()), 2, DATEADD(month, -3, GETDATE())); -- User 6: Gói BASIC đã hết hạn
GO

-- ====================================================================
-- 16. RESERVATIONS & RESERVATION DETAILS (Phiếu đặt trước)
-- Status: 0=PENDING, 1=APPROVED, 2=COMPLETED, 3=CANCELLED, 4=REJECTED, 5=EXPIRED
-- ====================================================================
INSERT INTO reservations (user_id, status, approved_at, expires_at, note, created_at) VALUES
(1, 1, DATEADD(day, -1, GETDATE()), DATEADD(day, 2, GETDATE()), N'Thủ thư đã duyệt, hẹn độc giả nhận trước 17h', DATEADD(day, -1, GETDATE())),
(4, 0, NULL,                        NULL,                       N'Độc giả đặt trước chờ duyệt',                 DATEADD(hour, -2, GETDATE())),
(5, 2, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE()), N'Đã hoàn tất nhận sách tại quầy',             DATEADD(day, -6, GETDATE())),
(6, 3, NULL,                        NULL,                       N'Độc giả chủ động hủy phiếu do bận việc',      DATEADD(day, -10, GETDATE()));
GO

INSERT INTO reservation_details (reservation_id, book_id) VALUES
(1, 2), -- Đơn 1: Đặt Effective Java
(1, 5), -- Đơn 1: Đặt Computer Networks
(2, 4), -- Đơn 2: Đặt Operating System Concepts
(3, 7), -- Đơn 3: Đặt Tôi Thấy Hoa Vàng Trên Cỏ Xanh
(4, 1); -- Đơn 4: Đặt Clean Code
GO

-- ====================================================================
-- 17. BORROW RECORDS & BORROW DETAILS (Phiếu mượn trả)
-- Status: 0=PENDING, 1=BORROWING, 2=RETURNED, 3=OVERDUE, 4=CANCELLED
-- Deposit Status: 0=NO_DEPOSIT, 1=PAID, 2=REFUNDED, 3=UNPAID
-- ====================================================================
INSERT INTO borrow_records (user_id, librarian_id, reservation_id, borrow_date, due_date, deposit_amount, extension_count, status, deposit_status, note, created_at) VALUES
-- Phiếu 1: User 1 đang mượn Clean Code (được miễn cọc do gói PREMIUM)
(1, 2, NULL, DATEADD(day, -5, GETDATE()),  DATEADD(day, 9, GETDATE()),  0,      0, 1, 0, N'Độc giả mượn trực tiếp tại quầy, miễn cọc gói Premium', DATEADD(day, -5, GETDATE())),
-- Phiếu 2: User 4 đang mượn Refactoring (đã đặt cọc 50%)
(4, 2, NULL, DATEADD(day, -3, GETDATE()),  DATEADD(day, 11, GETDATE()), 175000, 0, 1, 1, N'Độc giả mượn tại quầy, đặt cọc 50% tiền sách',       DATEADD(day, -3, GETDATE())),
-- Phiếu 3: User 5 đã trả sách Tôi Thấy Hoa Vàng đúng hạn, đã hoàn cọc
(5, 2, 3,    DATEADD(day, -15, GETDATE()), DATEADD(day, -1, GETDATE()), 150000, 1, 2, 2, N'Đã hoàn tất trả sách và hoàn cọc đầy đủ',            DATEADD(day, -15, GETDATE())),
-- Phiếu 4: User 6 mượn Computer Networks bị QUÁ HẠN 10 ngày
(6, 2, NULL, DATEADD(day, -24, GETDATE()), DATEADD(day, -10, GETDATE()), 450000, 0, 3, 1, N'Quá hạn chưa trả sách, hệ thống đã tính tiền phạt',   DATEADD(day, -24, GETDATE()));
GO

-- Chi tiết phiếu mượn (Status: 1=APPROVE, Return_Status: 1=NORMAL, 2=DAMAGED, 3=LOST)
INSERT INTO borrow_details (borrow_id, copy_id, status, return_date, return_status, note) VALUES
(1, 3,  1, NULL,                        NULL, N'Sách mượn bình thường, bìa còn mới'),
(2, 6,  1, NULL,                        NULL, N'Sách mượn tình trạng tốt'),
(3, 17, 1, DATEADD(day, -2, GETDATE()), 1,    N'Trả sách đúng hẹn, sách nguyên vẹn'),
(4, 14, 1, NULL,                        NULL, N'Sách chưa trả, quá hạn 10 ngày');
GO

-- ====================================================================
-- 18. FINES (Tiền phạt)
-- Reason: 1=OVERDUE, 2=DAMAGED, 3=LOST
-- Status: 0=UNPAID, 1=PAID, 2=WAIVED
-- ====================================================================
INSERT INTO fines (borrow_id, user_id, amount, copy_id, reason, status, note, created_at) VALUES
-- User 6 nợ phạt trễ hạn 10 ngày (10 x 5.000đ = 50.000đ)
(4, 6, 50000, 14, 1, 0, N'Phạt quá hạn 10 ngày cho cuốn Computer Networks (Mã vạch CN-0002)', DATEADD(day, -1, GETDATE())),
-- User 4 từng làm rách nhẹ trang sách nhưng đã nộp phạt tại quầy
(2, 4, 30000, 6,  2, 1, N'Phạt rách trang sách kỹ thuật, độc giả đã thanh toán tiền mặt',      DATEADD(day, -2, GETDATE()));
GO

-- ====================================================================
-- 19. PAYMENTS (Lịch sử thanh toán giao dịch)
-- Payment_Type: 1=FINE, 2=MEMBERSHIP, 3=DEPOSIT, 4=DEPOSIT_REFUND
-- Payment_Method: 1=CASH, 2=VNPAY, 3=PAYOS
-- Status: 0=PENDING, 1=SUCCESS, 2=FAILED, 3=CANCELLED
-- ====================================================================
INSERT INTO payments (user_id, payment_type, borrow_id, fine_id, plan_id, amount, payment_method, txn_ref, gateway_txn_no, bank_code, status, note, paid_at, created_at) VALUES
-- User 1 mua gói hội viên PREMIUM qua VNPay
(1, 2, NULL, NULL, 3, 300000, 2, 'PAY_MB_20261001_001', 'VNP14829104', 'NCB', 1, N'Thanh toán gói hội viên PREMIUM 1 năm qua VNPay', DATEADD(month, -1, GETDATE()), DATEADD(month, -1, GETDATE())),
-- User 4 mua gói hội viên STANDARD qua VNPay
(4, 2, NULL, NULL, 2, 120000, 2, 'PAY_MB_20261010_002', 'VNP14830512', 'NCB', 1, N'Thanh toán gói hội viên STANDARD 90 ngày qua VNPay', DATEADD(day, -20, GETDATE()), DATEADD(day, -20, GETDATE())),
-- User 4 nộp tiền cọc khi mượn sách qua Tiền mặt tại quầy
(4, 3, 2,    NULL, NULL, 175000, 1, 'PAY_DEP_20261015_001', NULL, NULL, 1, N'Thủ thư thu tiền cọc mượn sách tại quầy', DATEADD(day, -3, GETDATE()), DATEADD(day, -3, GETDATE())),
-- User 4 nộp tiền phạt hỏng sách bằng Tiền mặt tại quầy
(4, 1, NULL, 2,    NULL, 30000,  1, 'PAY_FINE_20261016_001', NULL, NULL, 1, N'Nộp phạt hư hỏng sách tại quầy cho thủ thư', DATEADD(day, -2, GETDATE()), DATEADD(day, -2, GETDATE())),
-- User 5 nhận hoàn tiền cọc khi trả sách
(5, 4, 3,    NULL, NULL, 150000, 1, 'PAY_REF_20261016_002', NULL, NULL, 1, N'Hoàn trả 100% tiền cọc khi độc giả trả sách nguyên vẹn', DATEADD(day, -2, GETDATE()), DATEADD(day, -2, GETDATE()));
GO

-- ====================================================================
-- 20. NOTIFICATIONS (Thông báo hệ thống)
-- Type: 1=RESERVATION, 2=DUE_DATE_REMINDER, 3=OVERDUE, 4=PAYMENT, 5=MEMBERSHIP
-- ====================================================================
INSERT INTO notifications (user_id, title, type, is_read, read_at, created_at) VALUES
(1, N'Đơn đặt trước sách của bạn đã được thủ thư phê duyệt thành công!', 1, 1, DATEADD(hour, -20, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, N'Chào mừng bạn đến với gói hội viên PREMIUM 1 năm của ULMS!',      5, 1, DATEADD(day, -29, GETDATE()), DATEADD(month, -1, GETDATE())),
(4, N'Sách mượn "Refactoring" sắp đến hạn trả trong 3 ngày tới.',       2, 0, NULL,                           DATEADD(hour, -4, GETDATE())),
(6, N'Cảnh báo: Bạn có phiếu mượn sách đã quá hạn 10 ngày chưa trả!',    3, 0, NULL,                           DATEADD(day, -1, GETDATE())),
(4, N'Biên lai thu tiền cọc phiếu mượn #2 đã được tạo thành công.',     4, 1, DATEADD(day, -3, GETDATE()),   DATEADD(day, -3, GETDATE()));
GO

-- ====================================================================
-- 21. BLACKLISTS (Danh sách cảnh báo / cấm mượn)
-- Created_By_Type: 1=AUTO_SYSTEM, 2=MANUAL_LIBRARIAN
-- ====================================================================
INSERT INTO blacklists (user_id, reason, created_by_type, created_by_user, is_active, created_at) VALUES
(6, N'Hệ thống tự động đưa vào danh sách hạn chế mượn do quá hạn trả sách trên 10 ngày', 1, NULL, 1, DATEADD(day, -1, GETDATE()));
GO