const express = require("express");
const pool = require("./db");
const courseRoutes = require("./routes/courseRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/accounts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM accounts ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get accounts" });
  }
});

app.use("/course", courseRoutes);
app.use(errorHandler);

module.exports = app;
