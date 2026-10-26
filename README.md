## [UI Design](https://www.figma.com/design/9nBok4bAuG73OoRjjCpUL5/Untitled?node-id=0-1&p=f&m=dev)


## Setup

### 1. Start the database
From the project root:
```bash
docker compose up -d
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Run migrations
Set the database URL (replace `YOUR_PASSWORD` with the password in your `docker-compose.yml`):

PowerShell:
```powershell
$env:DATABASE_URL="postgres://postgres:YOUR_PASSWORD@localhost:5432/english_platform"
npx node-pg-migrate up
```

macOS/Linux:
```bash
export DATABASE_URL="postgres://postgres:YOUR_PASSWORD@localhost:5432/english_platform"
npx node-pg-migrate up
```

### 4. Seed the database
From the project root:
```bash
npx node-pg-migrate up --migrations-dir ./database/seed
```

### 5. Send API requests
Install the **REST Client** extension in VS Code to run the `.http` request files.
