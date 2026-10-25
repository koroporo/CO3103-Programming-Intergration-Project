CREATE TABLE user_data (
    account_id BIGINT PRIMARY KEY
        REFERENCES accounts(id)
        ON DELETE CASCADE,

    sex VARCHAR(20),
    phone_number VARCHAR(20),
    birthday DATE,
    school VARCHAR(200),
    target_skill VARCHAR(50),
    target_level NUMERIC(3,1)
);