@echo off
title SmartExpense-AI - Frontend (Vite)
color 0a
echo ========================================================
echo   Starting SmartExpense-AI Frontend on http://localhost:3000
echo ========================================================
echo.
cd /d "%~dp0frontend"
npm run dev
pause
