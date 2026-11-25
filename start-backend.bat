@echo off
title SmartExpense-AI - Backend API (Node.js)
color 0e
echo ========================================================
echo   Starting SmartExpense-AI Backend API on http://localhost:5003
echo ========================================================
echo.
cd /d "%~dp0backend"
npm start
pause
