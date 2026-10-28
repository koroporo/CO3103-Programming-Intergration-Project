# API tạo nội dung khóa học

Hướng dẫn đọc code cho người mới: [COURSE_WALKTHROUGH.md](COURSE_WALKTHROUGH.md).

Module dùng schema trong `database/init.sql`, không cần đổi database.
Đây là quy ước triển khai đề xuất để nhóm đối chiếu với phần GET của Khôi.

| Method | URL | Chức năng |
| --- | --- | --- |
| POST | `/course/post` | Tạo thông tin chi tiết của course |
| POST | `/course/chapter/post` | Tạo chapter trong course |
| POST | `/course/lesson/post` | Tạo lesson trong chapter |
| POST | `/course/material/post` | Tạo material trong lesson |

Các endpoint GET như `/course/get/:id` có thể bổ sung vào cùng `courseRoutes.js`.
Phần này chỉ triển khai POST theo phạm vi công việc.

## Cấu trúc và trách nhiệm

```text
src/
  app.js                         # Khai báo Express, mount /course, xử lý lỗi
  server.js                      # Chạy HTTP server
  routes/courseRoutes.js         # URL + middleware + controller
  controllers/courseController.js # Nhận request, trả response 201
  services/courseService.js      # Validate và kiểm tra nghiệp vụ/chủ sở hữu
  models/courseModel.js          # SQL có tham số, đọc/ghi PostgreSQL
  models/accountModel.js         # Đọc role/status hiện tại của account
  middleware/authMiddleware.js  # Kiểm tra JWT có sẵn
  middleware/roleMiddleware.js   # Kiểm tra tài khoản active, role instructor
  middleware/errorMiddleware.js  # Trả lỗi JSON thống nhất
  ultils/courseUltils.js         # Các hàm hỗ trợ export cho service
```

Luồng: request → xác thực JWT → kiểm tra role hiện tại → controller → service
→ model → database. Express 5 tự chuyển lỗi từ hàm async tới error middleware.
Mỗi request chỉ INSERT một bản ghi nên không cần transaction nhiều bước.

Middleware xác thực và role được gắn riêng trên từng POST trong courseRoutes,
để GET bổ sung sau này có thể tự khai báo quyền truy cập phù hợp.

## Phân quyền

- Tất cả POST cần `Authorization: Bearer <token>`.
- Tài khoản phải tồn tại, `status=active`, role hiện tại trong DB là `instructor`.
- Chủ sở hữu course lấy từ account đã xác thực. Client không chọn được `instructor_id`.
- Chapter, lesson và material đều kiểm tra instructor sở hữu course cha, kể cả qua nhiều cấp.
- Không thêm nội dung vào course `hidden` hoặc `archived`.
- Course và lesson mới luôn `draft`. Course luôn khởi tạo `is_featured=false`.
  Các trường `instructor_id`, `status`, `is_featured` gửi từ client không được dùng.

Admin không có quyền tạo trong module này: schema quy định course do instructor sở hữu.
API quản trị/publish được triển khai riêng khi nhóm thống nhất nghiệp vụ.

## Request body

Tên trường dùng snake_case theo database. ID nhận số nguyên dương hoặc chuỗi số;
nên gửi chuỗi để giữ chính xác giá trị PostgreSQL BIGINT.
Các trường không có trong danh sách được bỏ qua.

| API | Bắt buộc | Tùy chọn / mặc định |
| --- | --- | --- |
| Course | `category_id`, `title`, `description` | `slug` tự tạo từ title + UUID; `prerequisite_text`, `thumbnail_url` mặc định null |
| Chapter | `course_id`, `title`, `position` | Không có |
| Lesson | `chapter_id`, `title`, `position` | `is_required=true`, `required_watch_percentage=80` |
| Material | `lesson_id`, `title`, `material_type`, `position`; thêm nội dung theo loại | `is_required=true`; `mime_type`, `duration_seconds` mặc định null |

- `title`: tối đa 250 ký tự, không rỗng. `slug`: tối đa 280 ký tự,
  gồm chữ thường a–z, số và dấu `-` ngăn cách; slug trùng trả 409.
- Category phải có sẵn trong bảng `categories`. Database hiện chưa seed category;
  có thể tạo dữ liệu local bằng SQL bên dưới rồi dùng ID trả về:

  ```sql
  INSERT INTO categories (name, slug)
  VALUES ('IELTS Listening', 'ielts-listening') RETURNING id;
  ```

- `position`: số nguyên JSON > 0, tối đa 2147483647. Client chọn vị trí;
  vị trí trùng trong cùng course/chapter/lesson trả 409, không tự dịch thứ tự.
- `required_watch_percentage`: số > 0 và ≤ 100, tối đa 2 chữ số thập phân.
- `material_type=text` cần `text_content` không rỗng.
- `material_type=audio|slides|file` cần `resource_url`; `text_content` được lưu null.
- `resource_url`, `thumbnail_url` nhận HTTP(S) URL hoặc object key, không nhận file nhị phân.
  Upload file lên storage trước, sau đó gửi URL/key vào API này.
- `duration_seconds` chỉ dùng cho audio, nếu truyền phải là số nguyên > 0.
- Video thuộc bảng `videos`, không phải một loại material. Lesson tạo ở trạng thái
  draft có thể chưa có video; API publish sau này phải kiểm tra đúng một video.

Mẫu body và thứ tự gửi request nằm trong `course.http` (VS Code REST Client).
Các request có tên tự truyền ID từ response sang bước tiếp theo.

## Response

Tạo thành công trả HTTP 201:

```json
{
  "message": "Chapter created successfully",
  "data": { "id": "30", "course_id": "20", "title": "Listening", "position": 1 }
}
```

Lỗi trả `{ "message": "..." }`:

| HTTP status | Ý nghĩa |
| --- | --- |
| 400 | Body/JSON không hợp lệ, thiếu trường hoặc sai kiểu |
| 401 | Thiếu token, token sai hoặc hết hạn |
| 403 | Sai role, tài khoản không active hoặc không sở hữu course |
| 404 | Category hoặc đối tượng cha không tồn tại |
| 409 | Trùng slug/vị trí hoặc course đang hidden/archived |
| 413 | Body vượt giới hạn JSON của Express (mặc định 100 KB) |
| 500 | Lỗi hệ thống; response không chứa chi tiết SQL |

## Chạy và kiểm tra

1. Trong `backend`, chạy `npm install`, copy `.env.example` thành `.env` rồi
   điền DB và `JWT_SECRET` giống phần đăng nhập của nhóm.
2. Chạy PostgreSQL với `database/init.sql` (ví dụ `docker compose up -d` ở root).
3. Chạy `npm run dev`, mở `course.http`, điền token và category ID, gửi lần lượt.
4. Chạy `npm test` để kiểm tra HTTP, validation, role, ownership và xử lý lỗi.

Tests dùng model giả lập, không kết nối hay thay đổi database local; chưa thay
thế kiểm thử tích hợp trên PostgreSQL thật.

Lưu ý về BE hiện tại: `tokenService.js` đã có hàm tạo/kiểm tra JWT nhưng repo
chưa nối route đăng nhập. `authService.js` cũng còn thiếu dependency `bcryptjs`
và hàm `accountModel.findByEmail`. Module POST này dùng token do phần đăng nhập
phát hành; việc hoàn thiện login nằm ngoài phạm vi module course.
