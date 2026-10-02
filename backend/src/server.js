const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});
app.post("/accounts", async (req, res) => {
    try {
        const {
            email,
            password_hash,
            full_name,
            role,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO accounts
                (email, password_hash, full_name, role, status,
                 created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING *`,
            [
                email,
                password_hash,
                full_name,
                role,
                status
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create account" });
    }
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
