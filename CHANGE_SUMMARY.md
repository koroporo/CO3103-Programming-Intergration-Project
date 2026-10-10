# Account authentication changes

This file summarizes the account registration and password recovery changes
implemented for later commit, push, and merge into the shared project.

## Scope

- Add account registration.
- Add forgot-password request.
- Add password reset.
- Add database health check.
- Improve password and account data handling.
- Update local setup and API documentation.

## Changed files

### Added

- `backend/src/auth.js`
  - Password hashing with Node.js `crypto.scrypt`.
  - Password verification with a constant-time comparison.
  - Email normalization.
  - Cryptographically secure password-reset token generation.
  - SHA-256 hashing for reset tokens before database storage.
  - 30-minute reset-token expiry.

### Updated

- `backend/src/server.js`
  - Added `GET /health`.
  - Added `POST /accounts/register`.
  - Added `POST /auth/forgot-password`.
  - Added `POST /auth/reset-password`.
  - Added request validation.
  - Added duplicate-email handling.
  - Added transaction handling for password reset.
  - Prevented reset-token reuse.
  - Revoked previous and remaining reset tokens.
  - Stopped returning `password_hash` from `GET /accounts`.
  - Exported the Express app for future automated tests.

- `backend/src/db.js`
  - Removed database credential and connection-detail logging.
  - Kept PostgreSQL pool configuration through environment variables.

- `backend/.env.example`
  - Added `PORT`.
  - Added `RESET_TOKEN_DEBUG`.
  - Removed the inline password comment that could invalidate `.env` parsing.

- `README.md`
  - Documented backend startup.
  - Documented database environment variables.
  - Documented the health endpoint.
  - Documented registration and password-recovery requests.
  - Documented local reset-token testing.

## API contract

### Register

```http
POST /accounts/register
Content-Type: application/json
```

```json
{
  "email": "learner@example.com",
  "password": "a-secure-password",
  "full_name": "Test Learner"
}
```

Requirements:

- Email must be valid.
- Email is normalized to lowercase.
- Full name must contain between 1 and 150 characters.
- Password must contain at least 8 characters.
- New accounts use role `user` and status `active`.

### Request password recovery

```http
POST /auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "learner@example.com"
}
```

The response intentionally does not reveal whether the email exists. Reset
tokens are stored as hashes in the existing `auth_tokens` table with purpose
`password_reset`.

For local testing only, set:

```env
RESET_TOKEN_DEBUG=true
```

This returns the reset token in the response. Do not enable this in production.
Email delivery still needs to be connected before production use.

### Reset password

```http
POST /auth/reset-password
Content-Type: application/json
```

```json
{
  "token": "reset-token-from-email",
  "password": "a-new-secure-password"
}
```

The token expires after 30 minutes and can only be used once. A successful
reset revokes other active password-reset tokens for the same account.

## Database impact

No schema migration is required. The existing `auth_tokens` table already
contains the fields needed for password recovery:

- `user_id`
- `token_hash`
- `purpose`
- `created_at`
- `expires_at`
- `consumed_at`
- `revoked_at`

## Validation performed

- `node --check backend/src/auth.js`
- `node --check backend/src/server.js`
- `node --check backend/src/db.js`
- Password hash round-trip test for correct and incorrect passwords.
- `git diff --check`

Full API integration testing requires installed backend dependencies and a
running PostgreSQL container.

## Merge checklist

1. Copy or merge the changed files listed above into the shared branch.
2. Create `backend/.env` locally from `backend/.env.example`.
3. Run PostgreSQL with Docker.
4. Run `npm install` in `backend`.
5. Start the backend with `npm start`.
6. Test `GET /health`.
7. Test registration, forgot-password, and reset-password.
8. Keep `RESET_TOKEN_DEBUG=false` outside local development.

