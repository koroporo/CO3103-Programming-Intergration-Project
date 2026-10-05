exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO accounts (
      email,
      password_hash,
      full_name,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      'test.learner@example.com',
      'TEMP_PASSWORD_HASH',
      'Test Learner',
      'user',
      'active',
      NOW(),
      NOW()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM accounts
    WHERE email = 'test.learner@example.com';
  `);
};