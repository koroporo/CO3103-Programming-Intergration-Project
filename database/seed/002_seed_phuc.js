exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO accounts (
      id,
      email,
      password_hash,
      full_name,
      role,
      target_overall_band,
      status,
      created_at,
      updated_at
    )
    VALUES (
      2452995,
      'letrongphuc@hcmut.com',
      '$2b$10$.nalMYVSqyNZWOiVy6pF.ON2GhyFcWcW3Rn0/OFBmhleCnG7jssvm',
      'Le Trong Phuc',
      'learner',
      9.9,
      'active',
      NOW(),
      NOW()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM accounts
    WHERE email = 'letrongphuc@hcmut.com';
  `);
};