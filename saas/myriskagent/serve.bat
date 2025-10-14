@echo off
echo 🚀 Starting MyRiskAgent Demo Server...
echo.
echo 📍 This will serve the demo at http://localhost:8080
echo 📱 Your browser should open automatically
echo ⏹️  Press Ctrl+C to stop the server
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.6+ and try again.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Start the server
python serve.py

pause
