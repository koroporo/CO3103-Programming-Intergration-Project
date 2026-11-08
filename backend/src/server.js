const express = require("express");
const pool = require("./db");
const cookieParser = require("cookie-parser");
const notificationRoutes = require("./routes/Notification/notificationRoutes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/notification", notificationRoutes);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
