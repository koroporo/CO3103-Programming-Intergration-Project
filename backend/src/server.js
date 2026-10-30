const express = require("express");
const { withDb, config } = require("./db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/Authentication/authRoutes");
const preferencesRoutes = require("./routes/Authentication/preferencesRoutes");
const passwordResetRoutes = require("./routes/Authentication/passwordResetRoutes");
const applicationRoutes = require("./routes/InstructorApplication/roleApplicationRoutes");
const courseRoutes = require("./routes/Course/courseRoutes");
const enrollmentRoutes = require("./routes/Enrollment/enrollmentRoutes");
const { errorHandler } = require("./middleware/Authentication/errorMiddleware");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
console.log("Incoming request:", req.method, req.originalUrl);
  next();
});

const api = express.Router();

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});
app.get("/health", async (req, res) => {
  try {
    await withDb( (sql) => sql`SELECT 1`)
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed", error);
    res.status(503).json({ status: "error" });
  }
});

api.use("/auth", authRoutes);
api.use("/auth", passwordResetRoutes);
api.use("/preferences", preferencesRoutes);
api.use("/role-applications", applicationRoutes);
api.use("/courses", courseRoutes);
api.use("/enrollment", enrollmentRoutes);

app.use("/api", api);
app.use(errorHandler); // phải nằm cuối

module.exports = app;