const express = require("express");
const pool = require("./db");
const courseRoutes = require("./routes/courseRoutes");

const app = express();
app.use(express.json());
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exitCode = 1;
  }
}

startServer();
