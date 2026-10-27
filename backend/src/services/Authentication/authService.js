const bcrypt = require("bcryptjs");
const accountModel = require("../models/accountModel");
const { generateToken } = require("./tokenService");

async function login(email, password) {
  // tìm tài khoản có email này trong database
  const user = await accountModel.findByEmail(email);

  if (!user) {
    return null; 
  }

  // so sánh mật khẩu nhập vào với mã băm đã lưu
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch || user.status !== "active") {
    return null;
  }

  // đăng nhập hợp lệ thì cấp token
  const token = generateToken(user);

  return {
    token: token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  };
}

module.exports = {
  login
};
