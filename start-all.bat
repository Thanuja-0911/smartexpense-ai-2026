@echo off
title SmartExpense-AI - Master Launcher
color 0b
echo ========================================================
echo         SmartExpense-AI - Starting Full-Stack SaaS
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5003)...
cd /d "%~dp0backend"
start "SmartExpense-AI Backend API" cmd /k "title SmartExpense-AI Backend API && npm start"

echo.
echo [2/3] Starting Frontend Vite Server (Port 3000)...
cd /d "%~dp0frontend"
start "SmartExpense-AI Frontend" cmd /k "title SmartExpense-AI Frontend && npm run dev"

cd /d "%~dp0"
echo.
echo [3/3] Waiting for servers to initialize...
timeout /t 3 >nul

echo.
echo Opening SmartExpense-AI in your default browser...
start http://localhost:3000

echo.
echo ========================================================
echo   SmartExpense-AI is now running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5003/api
echo ========================================================
echo.
pause
