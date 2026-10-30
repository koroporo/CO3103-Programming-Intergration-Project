const express = require("express");
const { withDb, config} = require("./db");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/accounts", async (req, res) => {
  try {
    const result = await withDb( (sql) => sql`SELECT * FROM accounts ORDER BY id`);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get accounts" });
  }
});

app.use("/course", courseRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use(errorHandler);

module.exports = app;
