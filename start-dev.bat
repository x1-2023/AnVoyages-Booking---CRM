@echo off
echo ================================================
echo   Globe Wanderer - Full Stack Dev Server
echo ================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking backend setup...
cd backend

if not exist "node_modules\" (
    echo Backend dependencies not found. Installing...
    call npm install
)

if not exist "prisma\dev.db" (
    echo Database not found. Initializing...
    call npm run prisma:generate
    call npm run prisma:push
    call npm run prisma:seed
)

echo.
echo [2/4] Starting Backend Server...
echo Backend will run at: http://localhost:3000
echo API Docs at: http://localhost:3000/api/docs
echo.

start "Globe Wanderer - Backend" cmd /k "npm run start:dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

cd ..

echo [3/4] Checking frontend setup...
if not exist "node_modules\" (
    echo Frontend dependencies not found. Installing...
    call npm install
)

echo.
echo [4/4] Starting Frontend Server...
echo Frontend will run at: http://localhost:5173
echo.

start "Globe Wanderer - Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   Servers are starting...
echo ================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:3000/api/docs
echo.
echo Login credentials:
echo Email: admin@globewanderer.com
echo Password: Admin@123456
echo.
echo Press Ctrl+C in each window to stop servers
echo ================================================

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Opening browser...
echo.
pause
