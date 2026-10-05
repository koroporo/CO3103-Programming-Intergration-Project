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



