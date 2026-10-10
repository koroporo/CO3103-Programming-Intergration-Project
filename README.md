## setup backend (phải ở folder backend)
cd backend
npm install
## setup frontend (phải ở trong frontendSE)
cd frontend
cd frontendSE
npm install


## setup database (phải ở folder CO3101-Programming-Intergration-Project nha)
docker compose up -d

## set up cho migration (ở trong folder backend)(nếu file chạy docker mọi người làm y chang thì chạy những lệnh ở dưới)
nếu có khác thì phải sửa thành $env:DATABASE_URL="postgres://<password>:postgre@localhost:5432/english_platform"
## seed database
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/english_platform"
npx node-pg-migrate up --migrations-dir .\database\seed (dùng để seed data cho database)
npx node-pg-migrate down --migrations-dir .\database\seed (xóa hết những data đã seed)


## để send request -> phải tải VSCode extension REST client
## fix lỗi bị error do sai password của docker postgre
-> do postgresql của máy chạy song song với docker postgresql trên cùng port 5432, vào window powershell với quyền admin chạy lệnh
Get-Service *postgres* (check xem window postgresql có đang chạy không Stopped, Running)
Stop-Service postgresql-x64-18
docker ps (nếu ra kết quả thì docker còn đang chạy)


