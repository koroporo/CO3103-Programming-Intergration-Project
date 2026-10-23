# Đọc hiểu backend course dành cho người mới

Đọc tài liệu này cùng các file trong `src/`. Bắt đầu bằng API tạo chapter vì
API này ít trường, nhưng vẫn đi qua đầy đủ các bước xử lý.

**1. Phần này đang làm được gì?**

| Method và URL | Tạo gì? | Bảng được INSERT |
| --- | --- | --- |
| `POST /course/post` | Thông tin khóa học | `courses` |
| `POST /course/chapter/post` | Một chương trong khóa học | `chapters` |
| `POST /course/lesson/post` | Một bài trong chương | `lessons` |
| `POST /course/material/post` | Một học liệu trong bài | `lesson_materials` |

POST ở đây tạo mới. Module chưa có API sửa, xóa hoặc publish.
"Course detail" là thông tin trong bảng `courses`, không có bảng `course_detail`
mới. Một POST course chưa tạo luôn các chapter/lesson/material bên trong.

```text
Instructor (accounts.id)
  └── Course (courses.instructor_id)
        └── Chapter (chapters.course_id)
              └── Lesson (lessons.chapter_id)
                    └── Material (lesson_materials.lesson_id)
```

Ví dụ `chapters.course_id = 20` nghĩa là chapter thuộc course có `id = 20`.
Các ID không nhất thiết bằng nhau: course 20 có thể chứa chapter 30, lesson 40.

**2. Những từ/cú pháp sẽ gặp**

| Từ/cú pháp | Ý nghĩa trong code |
| --- | --- |
| Client | Bên gửi request: frontend, Postman hoặc REST Client |
| Request / response | Yêu cầu client gửi lên / kết quả server gửi về |
| `req.body` | Object lấy từ JSON trong request |
| `req.headers.authorization` | Header chứa `Bearer <token>` |
| `req.user` | Tài khoản do middleware gắn vào request |
| `res.status(201).json(...)` | Trả HTTP 201 và dữ liệu JSON |
| `next()` | Cho Express chạy hàm tiếp theo trong chuỗi xử lý |
| `async function` | Hàm trả Promise, dùng được await bên trong |
| `await` | Đợi Promise, ví dụ truy vấn DB, trước khi chạy dòng sau trong hàm |
| `throw error` | Dừng luồng bình thường và phát sinh lỗi |
| `require(...)` | Nạp một module khác |
| `module.exports` | Chọn hàm/giá trị cho file khác sử dụng |

`await` tạm dừng phần còn lại của hàm hiện tại, không chặn toàn bộ server xử lý
request khác. Khi thao tác chờ bị lỗi, hàm async cũng báo lỗi.

**3. Vì sao chia nhiều file?**

| File | Câu hỏi file đó giải quyết |
| --- | --- |
| `server.js` | Server lắng nghe ở cổng nào? |
| `app.js` | App có những nhóm route nào, dùng middleware nào? |
| `routes/courseRoutes.js` | URL này gọi hàm nào, cần kiểm tra gì trước? |
| `middleware/authMiddleware.js` | Token có chữ ký đúng và còn hạn không? |
| `middleware/roleMiddleware.js` | Tài khoản active và có role được phép không? |
| `controllers/courseController.js` | Lấy request và trả response thế nào? |
| `services/courseService.js` | Dữ liệu và quy tắc nghiệp vụ có hợp lệ không? |
| `models/courseModel.js` | Cần chạy câu SQL nào? |
| `models/accountModel.js` | Đọc role/status hiện tại của account bằng SQL nào? |
| `ultils/courseUltils.js` | Những hàm hỗ trợ nào có thể dùng lại? |
| `middleware/errorMiddleware.js` | Khi có lỗi thì trả status và message gì? |

Service nhận `body` và `user`, không nhận toàn bộ `req`, để tập trung vào dữ
liệu và nghiệp vụ, không phụ thuộc cách Express gửi response.

**4. Đi theo một request tạo chapter**

Giả sử account 10 là instructor active, sở hữu course 20. Thay `<token>` bằng
token thật khi gửi request:

```http
POST http://localhost:3000/course/chapter/post
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "20",
  "title": "Listening cơ bản",
  "position": 1
}
```

`course_id` xác định khóa học cha. `position=1` là thứ tự chapter trong course,
không phải ID của chapter. Database tự sinh ID mới.

**Bước A: app và router nhận request.**

Trong `app.js`, `express.json()` chuyển JSON body thành object `req.body`.
`app.use("/course", courseRoutes)` chuyển request có tiền tố `/course` cho
router course. Trong `courseRoutes.js`:

```js
router.post(
  "/chapter/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createChapter
);
```

Tiền tố `/course` ghép với `/chapter/post` tạo URL đầy đủ. Express chạy các hàm
theo thứ tự trong danh sách.

`authorizeRoles("instructor")` chạy lúc cấu hình route và trả về hàm middleware
`checkRole`. Express gọi hàm trả về đó cho mỗi request. `...allowedRoles` gom
các role thành mảng; ở đây là `["instructor"]`. `includes(account.role)` kiểm
tra role account có trong danh sách không.

Middleware chỉ gắn từng POST, để GET của Khôi có thể khai báo quyền riêng.

**Bước B: kiểm tra token và role.**

`authenticate` đã có từ trước. Nó đọc header, gọi `verifyToken`, kiểm tra chữ
ký/hạn sử dụng rồi gắn `req.user`, ví dụ `{ id: "10", role: "instructor" }`.
Token sai/hết hạn thì trả 401.

`roleMiddleware` gọi `accountModel.findById(req.user.id)` đọc account trong DB.
Account phải active và có role instructor. Đọc lại DB vì token có thể vẫn
chứa role cũ sau khi admin đổi quyền hoặc khóa tài khoản.

Vượt qua bước này thì cập nhật `req.user` theo DB và gọi `next()`. Có token
hợp lệ chưa có nghĩa là có quyền tạo: learner vẫn bị trả 403.

**Bước C: controller gọi service.**

```js
const createdChapter = await courseService.createChapter(req.body, req.user);
```

Controller đợi kết quả service. Nếu service báo lỗi thì không chạy phần trả 201.

**Bước D: service kiểm tra nghiệp vụ và gọi model.**

Hàm trong `courseService.js`, lược bỏ chú thích:

```js
async function createChapter(body, user) {
  const data = validateChapter(body);

  const course = await courseModel.findCourseById(data.course_id);
  assertCourseOwner(course, user);

  const createdChapter = await courseModel.createChapter(data);
  return createdChapter;
}
```

1. `validateChapter`: kiểm tra ID, title không rỗng/tối đa 250 ký tự, position
   là số nguyên dương. Trả object chỉ có trường được phép.
2. Tìm course cha; không có thì 404.
3. `assertCourseOwner`: so sánh `course.instructor_id` với `user.id`; khác nhau
   thì 403. Course hidden/archived thì 409.
4. Gọi model tạo chapter, rồi trả kết quả cho controller.

Role và chủ sở hữu là hai kiểm tra riêng: hai instructor không được thêm
chapter vào khóa của nhau.

**Bước E: model chạy SQL.**

```js
async function createChapter(data) {
  const sql = `
    INSERT INTO chapters (course_id, title, position)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [data.course_id, data.title, data.position];

  const result = await pool.query(sql, values);
  return result.rows[0];
}
```

`pool` ở `db.js` quản lý kết nối PostgreSQL. `$1`, `$2`, `$3` là tham số nhận
giá trị từ mảng `values` theo thứ tự. Tách dữ liệu khỏi SQL giúp tránh dữ liệu
client bị hiểu thành câu lệnh SQL. Không nối trực tiếp title vào câu lệnh.

`RETURNING *` yêu cầu DB trả bản ghi vừa tạo. `result.rows` là mảng kết quả;
INSERT này tạo một dòng nên dùng `rows[0]` lấy dòng đó.

**Bước F: controller trả kết quả.**

```js
res.status(201).json({
  message: "Chapter created successfully",
  data: createdChapter
});
```

Response ví dụ (ID do DB cấp, không cố định là 30):

```json
{
  "message": "Chapter created successfully",
  "data": {
    "id": "30",
    "course_id": "20",
    "title": "Listening cơ bản",
    "position": 1
  }
}
```

Client lấy `data.id` gửi trong `chapter_id` khi tạo lesson ở request tiếp theo.

**5. Khi có lỗi thì đi đâu?**

Ví dụ title rỗng: validation dùng `throw createError(400, ...)`. `createError`
tạo Error và gắn thuộc tính `statusCode`. Repo dùng Express 5 nên lỗi ném ra
hoặc Promise bị reject từ route/middleware async được chuyển tới error
middleware. `app.use(errorHandler)` nằm sau các route trong `app.js`.

| HTTP status | Ý nghĩa |
| --- | --- |
| 201 | Đã tạo thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Thiếu/sai/hết hạn token |
| 403 | Không có quyền hoặc account không active |
| 404 | Không tìm thấy đối tượng cần dùng |
| 409 | Trùng slug/position, hoặc course hidden/archived |
| 413 | JSON body quá lớn |
| 500 | Lỗi hệ thống chưa xử lý riêng |

Database có UNIQUE cho slug và cặp parent ID + position. Nếu hai request chọn
cùng vị trí, DB bảo đảm không lưu trùng. Error middleware đổi mã PostgreSQL
23505 thành HTTP 409. Mã PostgreSQL và mã HTTP là hai loại mã khác nhau.

**6. Điểm khác nhau giữa bốn API**

- Course: cần category tồn tại. Owner lấy từ account xác thực; luôn tạo draft
  và is_featured=false. Slug là tên dạng URL, tự tạo từ title + UUID nếu không gửi.
- Chapter: nhận course_id, kiểm tra trực tiếp chủ course.
- Lesson: nhận chapter_id; model JOIN chapters với courses để tìm chủ course.
  Mặc định draft, is_required=true, required_watch_percentage=80.
- Material: nhận lesson_id; tìm course qua lesson → chapter → course. Text cần
  text_content; audio/slides/file cần resource_url.

Ngưỡng xem 80% là cấu hình bài học, chưa phải tiến độ xem thực tế. Module POST
chưa đo tiến độ hoặc xác định learner hoàn thành. Video nằm ở bảng videos,
không phải loại material. Material API lưu nội dung/đường dẫn, chưa upload file.
mime_type mô tả định dạng, ví dụ application/pdf. duration_seconds là thời
lượng audio nếu có; is_required xác định bài/học liệu có bắt buộc không.

**7. Đọc ultils và tự kiểm tra**

Đọc validateChapter trước, lần theo bốn hàm nó gọi: validateBody, positiveId,
requiredText, positiveInteger; sau đó đọc assertCourseOwner. Các hàm còn lại
phục vụ text tùy chọn, boolean, URL/object key, slug và phần trăm xem.

PostgreSQL BIGINT có thể lớn hơn số nguyên JavaScript biểu diễn chính xác,
nên giữ ID dạng chuỗi. position dùng INTEGER nhỏ hơn và nhận số JSON.
Các đoạn /.../ là biểu thức chính quy để kiểm tra/biến đổi chuỗi; xem chú thích
để hiểu điều kiện trước, chưa cần thuộc cú pháp ngay.

Khi có DB, category, token instructor và cấu hình .env hợp lệ: chạy npm run dev
trong backend, gửi lần lượt các request ở course.http. Thử title rỗng (400),
position trùng (409), bỏ token (401), dùng learner hoặc instructor khác (403).

npm test dùng model giả lập để kiểm tra luồng HTTP, quyền và validation; không
chứng minh SQL đã chạy trên PostgreSQL thật. GET /course/get/:id trong test là
route giả lập, không phải GET đã triển khai trong app thật.

Repo chưa nối route login; authService.js còn thiếu dependency bcryptjs và
hàm accountModel.findByEmail. Cần token từ phần login của nhóm để thử POST thật.

**8. Vì sao các file chung đã được thay đổi?**

- .env.example: mẫu PORT và JWT_SECRET, không sửa .env thật. PORT tùy chọn;
  JWT_SECRET được tokenService có sẵn yêu cầu.
- package.json và package-lock.json: thêm jsonwebtoken mà tokenService đã dùng,
  thêm lệnh npm test.
- server.js và app.js: tách cấu hình app khỏi listen để test tự chọn cổng;
  server thật vẫn chạy qua server.js.
- db.js: bỏ log password và truy vấn tự chạy khi import, vẫn giữ pool cho model.

Lần viết rõ hơn này không sửa tiếp các file cấu hình trên, chủ yếu tách bước
và thêm chú thích trong module course. Trước khi merge, nhóm cần review các
file chung và thống nhất URL với phần GET của Khôi.
