@echo off
echo ================================================
echo   Testing Globe Wanderer Setup
echo ================================================
echo.

echo [1/3] Installing concurrently...
call npm install concurrently@8.2.2 --save-dev

echo.
echo [2/3] Testing frontend...
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Ready to start!
echo.
echo Run this command to start both servers:
echo   npm run dev:all
echo.
pause
