# Salon Booking Platform - Windows PowerShell Setup Script

Write-Host "Salon Booking Platform Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Green
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "Node.js is not installed. Download from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Host "npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Push-Location backend
npm install
Write-Host "Backend dependencies installed" -ForegroundColor Green

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env -ErrorAction SilentlyContinue
    Write-Host "Created .env file - please update with your database credentials" -ForegroundColor Yellow
}

Pop-Location

Write-Host ""

# Frontend Setup
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Push-Location frontend
npm install
Write-Host "Frontend dependencies installed" -ForegroundColor Green

if (-not (Test-Path .env.local)) {
    Set-Content -Path .env.local -Value "NEXT_PUBLIC_API_URL=http://localhost:3000"
    Write-Host "Created .env.local" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your database credentials" -ForegroundColor White
Write-Host "2. Run: cd backend; npx prisma migrate dev" -ForegroundColor White
Write-Host "3. Run: cd backend; npm run start:dev" -ForegroundColor White
Write-Host "4. In another terminal: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Green
Write-Host "Backend API: http://localhost:3000" -ForegroundColor Green
