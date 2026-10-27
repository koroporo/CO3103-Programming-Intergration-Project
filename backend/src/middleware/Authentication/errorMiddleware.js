// Express nhận diện middleware xử lý lỗi qua đủ 4 tham số này.
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "23505") {
    return res.status(409).json({ message: "Slug or position already exists in this parent" });
  }
  // PostgreSQL 23503: khóa ngoại tham chiếu đến bản ghi không tồn tại.
  if (error.code === "23503") {
    return res.status(404).json({ message: "Referenced account, category, course, chapter or lesson not found" });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error("Request failed:", error.message);
  res.status(500).json({ message: "Internal server error" });
}

module.exports = { errorHandler };
