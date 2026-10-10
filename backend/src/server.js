const express = require("express");
const crypto = require("crypto");
const pool = require("./db");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

//COOKIE
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


//WORKFLOW HERE

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed", error);
    res.status(503).json({ status: "error" });
  }
});
app.get("/accounts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        email,
        password_hash,
        full_name,
        role,
        status,
        avatar_url,
        bio,
        created_at,
        updated_at
      FROM accounts
      ORDER BY id`
    );

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

//LOG IN, REGISTER 
const authRoutes = require("./routes/Authentication/authRoutes");

app.use("/api/auth", authRoutes);
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
