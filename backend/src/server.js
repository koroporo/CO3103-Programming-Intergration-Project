const express = require("express");
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

//LOG IN 
const authRoutes = require("./routes/Authentication/authRoutes");

app.use("/api/auth", authRoutes);