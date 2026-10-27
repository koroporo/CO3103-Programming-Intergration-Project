##setup backend (phải ở folder backend)
cd backend
npm install



##setup database (phải ở folder CO3101-Programming-Intergration-Project nha)
docker compose up -d

##set up cho migration (ở trong folder backend)(nếu file chạy docker mọi người làm y chang thì chạy cái lệnh ở dưới)
$env:DATABASE_URL="postgres://postgres:YOUR_PASSWORD@localhost:5432/english_platform" (unused)
$env:DATABASE_URL="postgres://postgres:postgre@localhost:5432/english_platform"

##seed database (ở folder chính) (dùng để seed data cho db)
npx node-pg-migrate up --migrations-dir .\database\seed


##để send request -> phải tải VSCode extension REST client

## Assessment workflow

The assessment API uses the existing PostgreSQL `assessments`, `question_banks`,
`questions`, `question_options`, `assessment_attempts`, `attempt_questions`,
and `attempt_answers` tables. Instructor requests require a JWT with the
`instructor` role; learner requests require an active enrollment in the course.

- `GET /assessments/authoring-data` returns the instructor's courses, lessons,
  and skills available for quiz questions.
- `POST /assessments` creates and publishes a lesson quiz. Each question must
  have exactly four options and exactly one correct option.
- `GET /assessments` lists published quizzes for the learner's active course
  enrollments.
- `POST /assessments/:assessmentId/attempts` starts or resumes an attempt.
- `PUT /assessments/attempts/:attemptId/answers` autosaves selected options.
- `POST /assessments/attempts/:attemptId/submit` grades and records the attempt.
- `GET /assessments/attempts/history` and
  `GET /assessments/attempts/:attemptId/result` return learner-owned history
  and per-question result details.

The frontend is in `frontend/frontendSE`. Set `VITE_API_URL` when the backend
is not at `http://localhost:3000`; connect with the current login flow's JWT
in the assessment page. The UI keeps that token only in the current tab's
session storage. Set `FRONTEND_ORIGIN` in `backend/.env` to a comma-separated
allowlist of frontend origins when the app is not running on Vite's default
localhost ports.

Run backend unit tests with `npm test` from `backend`. The optional PostgreSQL
integration test creates and cleans up its own fixture rows; enable it with
`RUN_ASSESSMENT_DB_TESTS=1` and the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
and `DB_PASSWORD` environment variables.

