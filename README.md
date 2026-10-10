## setup backend (phải ở folder backend)
cd backend
npm install
## setup frontend (phải ở trong frontendSE)
cd frontend
cd frontendSE
npm install
## Setup backend (phải ở folder backend)

```powershell
cd backend
npm install
npm start
```

## Setup database

## setup database (phải ở folder CO3101-Programming-Intergration-Project nha)
Chạy ở folder gốc của project:

```powershell
docker compose up -d
```

## set up cho migration (ở trong folder backend)(nếu file chạy docker mọi người làm y chang thì chạy những lệnh ở dưới)
nếu có khác thì phải sửa thành $env:DATABASE_URL="postgres://<password>:postgre@localhost:5432/english_platform"
## seed database
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/english_platform"
npx node-pg-migrate up --migrations-dir .\database\seed (dùng để seed data cho database)
npx node-pg-migrate down --migrations-dir .\database\seed (xóa hết những data đã seed)

## API tài khoản

## để send request -> phải tải VSCode extension REST client
## fix lỗi bị error do sai password của docker postgre
-> do postgresql của máy chạy song song với docker postgresql trên cùng port 5432, vào window powershell với quyền admin chạy lệnh
Get-Service *postgres* (check xem window postgresql có đang chạy không Stopped, Running)
Stop-Service postgresql-x64-18
docker ps (nếu ra kết quả thì docker còn đang chạy)

```http
POST http://localhost:3000/accounts/register
Content-Type: application/json

{
  "email": "learner@example.com",
  "password": "a-secure-password",
  "full_name": "Test Learner"
}
```

Mật khẩu phải có ít nhất 8 ký tự. Backend lưu mật khẩu dưới dạng hash,
không lưu mật khẩu gốc.

### Yêu cầu khôi phục mật khẩu

```http
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "learner@example.com"
}
```

Response luôn dùng thông báo chung để không tiết lộ email có tồn tại hay không.
Khi chưa tích hợp email, đặt `RESET_TOKEN_DEBUG=true` trong `backend/.env` để
nhận token trong response khi kiểm thử cục bộ. Không bật setting này trên
production.

### Đặt lại mật khẩu

```http
POST http://localhost:3000/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "a-new-secure-password"
}
```

Token reset có hiệu lực trong 30 phút và chỉ được sử dụng một lần.
