Write-Host "Starting RNA-seq Platform Services..." -ForegroundColor Green

Write-Host ""
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Yellow
Set-Location api
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Write-Host ""
Write-Host "Starting Frontend (React/Vite)..." -ForegroundColor Yellow
Set-Location ..\web-new
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "Services are starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
