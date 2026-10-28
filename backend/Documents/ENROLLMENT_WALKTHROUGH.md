# Đọc hiểu cơ chế enrollment

Enrollment là bản ghi cho biết **một học viên tham gia một khóa học**.
Ví dụ learner `10` đăng ký course `20`, database tạo enrollment `50`:

```json
{
  "id": "50",
  "learner_id": "10",
  "course_id": "20",
  "status": "active",
  "resume_lesson_id": null
}
```

Đây là ví dụ rút gọn. Bản ghi thật còn có các thời điểm đăng ký, truy cập,
rút khỏi khóa và hoàn thành. `enrollment.id`, `learner_id`, `course_id` là ba
ID khác nhau. Khi gọi `/enrollment/withdraw/50`, số `50` là enrollment ID.

**1. Bản code này đã được làm dễ đọc hơn ở đâu?**

- Bỏ hàm bọc `asLearner`: mỗi hàm nghiệp vụ gọi transaction trực tiếp và tự
  lấy learner ở đầu luồng. Không cần đi qua hai tầng hàm nhận callback.
- Đưa kiểm tra course và ownership vào ngay `enroll`, `withdraw`, `resume`.
  Đọc hàm từ trên xuống sẽ thấy điều kiện nào được kiểm tra trước khi ghi.
- Đổi các biểu thức `điều_kiện ? giá_trị_1 : giá_trị_2` và chuyển kiểu boolean
  sang các nhánh `if`, `else if`, giá trị `true`/`false` rõ ràng.
- Mỗi truy vấn model đều có `sql`, `values`, `result`, giống module course.
  Hai truy vấn GET được viết đầy đủ, không ghép từ một đoạn SQL ở nơi khác.
- Tách kiểm tra giới hạn của `limit`, `offset` ra khỏi hàm đọc số để nhìn rõ
  quy tắc từng trường. Thêm chú thích tiếng Việt ở các bước nghiệp vụ.

URL, body, cấu trúc response và các chức năng enrollment vẫn như tài liệu API.
Code có thể nhiều dòng hơn vì các bước được viết tách ra.

**2. Mỗi file làm gì?**

| File | Trách nhiệm |
| --- | --- |
| [app.js](src/app.js) | Gắn nhóm route vào tiền tố `/enrollment` |
| [enrollmentRoutes.js](src/routes/enrollmentRoutes.js) | Chọn controller theo method/URL, yêu cầu JWT và role learner |
| [enrollmentController.js](src/controllers/enrollmentController.js) | Lấy dữ liệu request, gọi service, trả HTTP và JSON |
| [enrollmentService.js](src/services/enrollmentService.js) | Kiểm tra quy tắc đăng ký/rút khỏi khóa/tiếp tục học |
| [enrollmentModel.js](src/models/enrollmentModel.js) | Chạy SQL, mở và kết thúc transaction |
| [enrollmentUltils.js](src/ultils/enrollmentUltils.js) | Kiểm tra body, ID và tham số phân trang |

Các middleware JWT, role, error và kết nối database dùng lại phần có sẵn.
`courseUltils.js` cung cấp `createError`, `validateBody`, `positiveId`, tránh
viết thêm một bộ kiểm tra ID giống hệt. Thư mục `ultils` giữ cách đặt tên của repo.

Luồng đọc code:

```text
Request → app → route → middleware → controller → service → model → PostgreSQL
                                               ← kết quả ←
Response ← controller
```

**3. Đi qua một request đăng ký mới**

Giả sử người đang đăng nhập có ID `10`, role learner và account active.
Frontend gửi:

```http
POST /enrollment/post
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "20"
}
```

`express.json()` trong app chuyển JSON thành `req.body`.
`app.use("/enrollment", enrollmentRoutes)` chuyển request cho router enrollment.
Trong router, `authenticate` kiểm tra chữ ký và hạn JWT. `authorizeRoles("learner")`
đọc account hiện tại từ database, yêu cầu account active và role learner.

Sau middleware, controller có:

```js
req.body = { course_id: "20" };
req.user = { id: "10", role: "learner" };
```

Đây là minh họa dữ liệu tại thời điểm đó, không phải đoạn cần gán thủ công.
Controller gọi `enrollmentService.enroll(req.body, req.user)`.

Hàm `enroll` xử lý lần lượt:

1. `validateEnrollment(body)` kiểm tra body là object và course ID hợp lệ.
2. Mở transaction, lấy và khóa account của learner bằng `getActiveLearner`.
3. Tìm enrollment của cặp `(learner.id, courseId)`.
4. Nếu đã `active` hoặc `completed`, trả lại bản ghi đó, không sửa gì.
5. Nếu cần tạo mới hoặc kích hoạt lại, kiểm tra course tồn tại và `published`.
6. Tìm các khóa tiên quyết chưa hoàn thành. Có khóa còn thiếu thì báo lỗi `409`.
7. Có enrollment `withdrawn` thì cập nhật bản ghi cũ; chưa có thì INSERT mới.
8. Ghi audit, commit transaction rồi trả kết quả cho controller.

`learner.id` lấy từ tài khoản đã xác thực. Nếu client tự gửi thêm
`learner_id: "99"`, service không dùng giá trị đó. Client cũng không thể tự
đặt trạng thái `completed` hay thời gian hoàn thành bằng request này.

**4. Vì sao service trả thêm `created`, `reactivated`?**

Đây là hai cờ giúp controller chọn response:

| Tình huống | `created` | `reactivated` | HTTP |
| --- | --- | --- | --- |
| Tạo enrollment mới | true | false | 201 |
| Kích hoạt lại enrollment withdrawn | false | true | 200 |
| Enrollment đã active/completed | false | false | 200 |

Controller dùng `if/else if` để chọn mã HTTP và lời nhắn. Hai cờ này chỉ dùng
giữa service và controller; response ra frontend gồm `message` và `data`.

**5. Model chạy SQL như thế nào?**

Ví dụ tạo enrollment:

```js
const sql = `
  INSERT INTO enrollments (learner_id, course_id, status, enrolled_at)
  VALUES ($1, $2, 'active', NOW()) RETURNING *
`;
const values = [learnerId, courseId];

const result = await client.query(sql, values);
return result.rows[0];
```

`$1` tương ứng phần tử đầu tiên trong `values`, `$2` tương ứng phần tử thứ hai.
Driver PostgreSQL truyền dữ liệu riêng khỏi câu SQL. Không ghép trực tiếp ID
do client gửi vào chuỗi truy vấn.

`NOW()` lấy thời gian từ database. `RETURNING *` trả lại bản ghi vừa tạo,
bao gồm ID tự sinh. `result.rows` là mảng kết quả; `rows[0]` là bản ghi đầu tiên.
Với SELECT tìm một bản ghi, `rows[0]` là `undefined` nếu không tìm thấy.

Các hàm INSERT/UPDATE dùng `client` do transaction cung cấp. Các hàm GET chỉ
đọc một câu SQL nên dùng `pool.query` trực tiếp.

**6. Transaction là gì, vì sao vẫn giữ một hàm callback?**

Một thao tác đăng ký có hai thay đổi cần đi cùng nhau: tạo enrollment và ghi
audit. Nếu enrollment đã được tạo nhưng audit lỗi, cần hủy thay đổi enrollment
để tránh lưu dữ liệu dở dang.

`withTransaction` thực hiện:

```text
pool.connect()     → lấy một connection PostgreSQL
BEGIN              → bắt đầu nhóm thao tác
runQueries(client) → chạy các bước service truyền vào
COMMIT             → lưu toàn bộ nếu thành công
ROLLBACK           → hủy thay đổi nếu có lỗi
client.release()   → trả connection về pool khi kết thúc
```

`COMMIT` và `ROLLBACK` là hai nhánh khác nhau, không chạy lần lượt trong một
thao tác thành công. `finally` đảm bảo luôn trả connection về pool.
Nếu ngay cả rollback cũng lỗi, code loại connection đó khỏi pool và vẫn báo
lỗi ban đầu; không trả connection hỏng cho request tiếp theo.

Trong service, đoạn `async (client) => { ... }` chính là hàm được truyền vào
`withTransaction`. Người ta gọi hàm truyền vào hàm khác như vậy là **callback**.
Phần mở/lưu/hủy transaction chỉ cần viết một lần; mỗi nghiệp vụ cung cấp các
câu truy vấn cần chạy bên trong. `client` ở đây là connection database, không
phải frontend hay Postman.

`await` đợi truy vấn hoàn tất rồi mới chạy dòng tiếp theo trong cùng hàm.
`return` bên trong callback trả kết quả về `withTransaction`; wrapper vẫn commit
trước khi kết quả được trả về controller. `throw` chuyển sang nhánh rollback.

**7. Khóa dòng dữ liệu dùng để làm gì?**

Nếu người dùng bấm đăng ký hai lần gần như cùng lúc, server có thể nhận hai
request trước khi request đầu ghi xong.

`lockLearner` dùng `SELECT ... FOR UPDATE` trên account. Các thao tác enrollment
của cùng learner đi qua bước này: request thứ hai đợi transaction đầu kết thúc,
sau đó đọc thấy enrollment đã tồn tại và trả lại nó. Khóa được PostgreSQL giải
phóng khi commit/rollback. Unique index `(learner_id, course_id)` trong schema
cũng ngăn hai bản ghi cho cùng cặp learner/course.

Khóa account còn giữ role/status ổn định trong lúc ghi. Middleware đã kiểm tra
quyền trước đó, nhưng account có thể bị sửa sau middleware, nên service kiểm tra
lại sau khi lấy khóa. `FOR SHARE` trên course/lesson cho phép nhiều transaction
đọc đồng thời, nhưng chặn thay đổi các dòng đó trong khi transaction đang dùng.

**8. Rút khỏi khóa và đăng ký lại**

`withdraw` tìm enrollment theo cả `id` và `learner_id`. Không có bản ghi phù hợp
thì trả `404`. Enrollment đang `active` được cập nhật thành `withdrawn`, thêm
`withdrawn_at`, ghi audit. Gọi lại với enrollment đã withdrawn trả bản ghi hiện
có; enrollment completed không được rút khỏi khóa.

Đăng ký lại dùng cùng `POST /enrollment/post`. `reactivateEnrollment` cập nhật
bản ghi withdrawn thành active, xóa mốc rút khỏi khóa và giữ nguyên enrollment ID.
Các bảng tiến độ tham chiếu enrollment ID đó nên dữ liệu học cũ vẫn còn.

**9. Lưu bài tiếp tục và đọc danh sách**

`resume` yêu cầu enrollment của người gọi đang active, course published và
lesson published thuộc đúng course. Query JOIN `lessons` với `chapters`, rồi
so sánh `chapters.course_id` với course của enrollment để xác định quan hệ.

Nếu hợp lệ, model cập nhật `resume_lesson_id` và `last_accessed_at`, rồi ghi audit.
Ví dụ lưu lesson `40` giúp frontend biết lần sau nên mở bài nào. Thao tác này
không tự tạo `lesson_progress.completed`, không tính hoàn thành khóa và không
thay thế kiểm tra quyền đọc video/học liệu.

`getById` luôn lọc theo enrollment ID và learner ID. `list` cũng chỉ lấy dữ liệu
của learner đang đăng nhập, có thể lọc theo `status`.

Ví dụ `?status=active&limit=20&offset=0`: lấy trang đầu của các khóa đang học.
`limit` là số bản ghi tối đa trả về; `offset` là số bản ghi bỏ qua.
Model lấy tối đa 21 dòng. Nếu có dòng thứ 21, service biết còn dữ liệu và đặt
`has_more=true`, nhưng chỉ trả 20 dòng. Thông tin course được gom bằng
`json_build_object` để frontend có sẵn tiêu đề, slug, thumbnail và trạng thái.

**10. Lỗi và kiểm thử**

`createError(409, "...")` tạo lỗi kèm mã HTTP. Service `throw` lỗi đó, transaction
rollback nếu đang mở. Express 5 chuyển lỗi từ hàm async tới `errorHandler`, nơi
trả JSON `{ "message": "..." }`. Lỗi nội bộ trả `500` với lời nhắn chung.

| Nhóm kiểm thử | Mục đích |
| --- | --- |
| `test/enrollment.test.js` | Gọi HTTP để kiểm tra JWT, role, input, ownership, trạng thái và response |
| `test/enrollmentTransaction.test.js` | Kiểm tra commit, rollback và trả connection |
| `test/enrollment.postgres.test.js` | Chạy SQL thật: đăng ký đồng thời, giữ progress, prerequisites, ownership, rollback audit |

Chạy `npm test` trong `backend`. Nhóm PostgreSQL cần `TEST_DATABASE_URL`, sẽ
tạo và xóa schema test riêng. Cách cấu hình và request mẫu nằm trong
[ENROLLMENT_API.md](ENROLLMENT_API.md) và [enrollment.http](enrollment.http).

Khi đọc lần đầu, nên bắt đầu từ `enrollmentRoutes.js`, sang controller `enroll`,
rồi theo `enrollmentService.enroll`. Mở model khi gặp một lời gọi SQL cần hiểu;
sau đó mới đọc transaction và các bài kiểm thử.
