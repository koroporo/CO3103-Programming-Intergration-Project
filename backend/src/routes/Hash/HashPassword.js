 app.post("/accounts/register", async (req, res) => {
   const { email, password, full_name: fullName } = req.body;
 
   if (
     typeof email !== "string" ||
     typeof fullName !== "string" ||
     !isValidEmail(email) ||
     fullName.trim().length < 1 ||
     fullName.trim().length > 150 ||
     !isValidPassword(password)
   ) {
     res.status(400).json({
       error: "A valid email, full name, and password of at least 8 characters are required",
     });
     return;
   }
 
   const normalizedEmail = normalizeEmail(email);
 try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO accounts (email, password_hash, full_name, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'user', 'active', NOW(), NOW())
       RETURNING id, email, full_name, role, status, created_at`,
      [normalizedEmail, passwordHash, fullName.trim()],
    );

    res.status(201).json({ account: publicAccount(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    console.error("Account registration failed", error);
    res.status(500).json({ error: "Failed to register account" });
  }
});

