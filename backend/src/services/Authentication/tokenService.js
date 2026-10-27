const jwt = require("jsonwebtoken"); // library
require("dotenv").config({ quiet: true });

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("Please set JWT_SECRET in backend/.env");
}

// chỉ gọi sau khi phần login đã kiểm tra tài khoản và mật khẩu thành công
function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role
  };

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "15m"
  });
}

// kiểm tra chữ ký và hạn sử dụng mà frontend gửi lại
function verifyToken(token) {
  return jwt.verify(token, secret, {
    algorithms: ["HS256"]
  });
}

module.exports = {
  generateToken,
  verifyToken
};
