@echo off
echo Starting RNA-seq Platform Services...

echo.
echo Starting Backend (FastAPI)...
cd api
start "Backend" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Starting Frontend (React/Vite)...
cd ..\web-new
start "Frontend" cmd /k "npm run dev"

echo.
echo Services are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to exit this script...
pause > nul
