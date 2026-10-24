# API enrollment

Giải thích từng file và từng bước xử lý: [ENROLLMENT_WALKTHROUGH.md](ENROLLMENT_WALKTHROUGH.md).

Module dùng bảng có sẵn trong `database/init.sql`, không cần migration.
Luồng xử lý: route → JWT + role hiện tại → controller → service → model → PostgreSQL.

## Endpoint

Tất cả endpoint cần `Authorization: Bearer <token>` và tài khoản `active`, role
hiện tại trong database là `learner`. ID nhận số nguyên dương hoặc chuỗi số;
nên gửi chuỗi để giữ chính xác PostgreSQL BIGINT.

| Method | URL | Body / query | Kết quả |
| --- | --- | --- | --- |
| POST | `/enrollment/post` | `{ "course_id": "20" }` | Đăng ký hoặc kích hoạt lại enrollment |
| GET | `/enrollment/get` | `status`, `limit`, `offset` tùy chọn | Danh sách của learner đang đăng nhập |
| GET | `/enrollment/get/:id` | Không có | Chi tiết enrollment của chính learner |
| PATCH | `/enrollment/withdraw/:id` | Không cần body | Rút khỏi khóa, giữ lịch sử học |
| PATCH | `/enrollment/resume/:id` | `{ "lesson_id": "40" }` | Lưu bài tiếp tục và thời điểm truy cập |

`:id` là **enrollment ID**, không phải course ID. Client không được chọn learner
khác; `learner_id`, `status`, các mốc thời gian và các trường ngoài danh sách
không được lấy từ request body.

## Quy tắc

- Đăng ký mới hoặc đăng ký lại cần course `published` và tất cả course trong
  `course_prerequisites` có enrollment `completed` của learner đó.
- Đăng ký mới trả `201`, trạng thái `active`. Chưa có bài tiếp tục nên
  `resume_lesson_id` và `last_accessed_at` là `null`.
- Đăng ký lặp khi đã `active` hoặc `completed` trả `200` cùng bản ghi, không
  tạo audit mới và không reset completion. Đây là thao tác không thay đổi dữ liệu,
  kể cả khi course sau đó bị ẩn hoặc lưu trữ.
- Đăng ký lại khi `withdrawn` trả `200`, đổi thành `active`, xóa `withdrawn_at`.
  Giữ ID, `enrolled_at`, `last_accessed_at`, bài tiếp tục và toàn bộ progress.
- Rút khỏi enrollment `active` đặt `withdrawn_at`; gọi lại khi đã `withdrawn`
  vẫn trả `200`. Không rút khỏi enrollment `completed`. Có thể rút khỏi khóa đã ẩn.
- Cập nhật bài tiếp tục chỉ khi enrollment `active`, course và lesson `published`,
  lesson thuộc đúng course. Thao tác này chỉ lưu vị trí tiếp tục; không cấp quyền
  đọc video/học liệu và không đánh dấu bài hoặc khóa đã hoàn thành.
- Đọc hoặc sửa enrollment của người khác trả `404`, giống ID không tồn tại.
- Các thay đổi và audit được ghi trong cùng transaction. Khóa account theo learner
  trước khi đọc/ghi enrollment để tuần tự hóa các request thay đổi của cùng người
  và kiểm tra lại role/status. Unique index `(learner_id, course_id)` có sẵn vẫn giữ nguyên.
- Audit ghi các action `enroll_course`, `reenroll_course`, `withdraw_course`,
  `update_enrollment_resume`, gồm snapshot trước/sau.

Module này chưa triển khai tính completion, kiểm tra mastery/thứ tự để mở bài,
hoặc cấp quyền truy cập nội dung. Các API học bài phải kiểm tra enrollment và
điều kiện học riêng; không dùng `resume_lesson_id` làm bằng chứng đã học xong.

## Response và phân trang

POST/PATCH trả `{ "message": "...", "data": { ...enrollment } }`.
GET chi tiết trả `{ "data": { ...enrollment, "course": { ... } } }`.
Thông tin course trong GET gồm `id`, `title`, `slug`, `thumbnail_url`, `status`.

GET danh sách mặc định lấy mọi trạng thái, `limit=20`, `offset=0`.
`status` chỉ nhận `active`, `withdrawn`, `completed`; `limit` từ 1 đến 100,
`offset` từ 0 đến 2147483647. Sắp xếp `enrolled_at DESC, id DESC`.

```json
{
  "data": [],
  "pagination": { "limit": 20, "offset": 0, "has_more": false }
}
```

Lỗi trả `{ "message": "..." }`: `400` dữ liệu không hợp lệ, `401` JWT thiếu/sai/hết hạn,
`403` tài khoản không có quyền, `404` đối tượng không tồn tại/không thuộc người gọi,
`409` trạng thái hoặc khóa tiên quyết không cho phép, `500` lỗi hệ thống đã ẩn chi tiết SQL.

## Chạy thử

1. Chuẩn bị database theo README và `JWT_SECRET` trong `backend/.env`.
2. Dùng account learner active, course published và lesson published thuộc course
   đó. Course/lesson được tạo bởi API course hiện tại mặc định là draft; API publish
   chưa có trong repo, cần chuẩn bị fixture trên database phát triển.
3. Chạy `npm run dev` trong `backend`; điền token, course/lesson ID vào
   [enrollment.http](enrollment.http), gửi request theo thứ tự.

Repo hiện chưa nối route login; dùng token từ module đăng nhập của nhóm. Để thử
local, có thể tạo token cho **ID learner có thật trong database phát triển** bằng
`generateToken` có sẵn (chạy trong `backend`, thay `10` bằng ID của bạn):

```sh
node -e 'require("dotenv").config({quiet:true}); console.log(require("./src/services/tokenService").generateToken({id:"10",role:"learner"}))'
```

## Kiểm thử

Trong `backend`, chạy `npm test` cho HTTP, phân quyền, validation, trạng thái và
transaction. Tests HTTP giả lập model, không sửa database local.

Để chạy thêm kiểm thử PostgreSQL thật, đặt `TEST_DATABASE_URL` trỏ tới **database test**
có quyền tạo schema rồi chạy `npm test`. Ví dụ shell macOS/Linux:

```sh
TEST_DATABASE_URL='postgres://USER:PASSWORD@localhost:5432/TEST_DB' npm test
```

Bộ PostgreSQL tự tạo schema ngẫu nhiên, nạp `database/init.sql`, kiểm tra đăng ký
đồng thời, giữ progress, ownership, prerequisites và rollback audit; sau đó xóa schema
test. Không có `TEST_DATABASE_URL` thì nhóm kiểm thử PostgreSQL được bỏ qua.
