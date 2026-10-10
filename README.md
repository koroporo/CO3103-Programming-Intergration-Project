## Setup backend (phải ở folder backend)

```powershell
cd backend
npm install
npm start
```

## Setup database

Chạy ở folder gốc của project:

```powershell
docker compose up -d
```

Tạo file `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_platform
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
RESET_TOKEN_DEBUG=false
```

Kiểm tra kết nối:

```http
GET http://localhost:3000/health
```

## Seed database

Chạy ở folder gốc:

```powershell
npx node-pg-migrate up --migrations-dir .\database\seed
```

## API tài khoản

Có thể gửi các request dưới đây bằng REST Client extension của VS Code.

### Đăng ký

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
