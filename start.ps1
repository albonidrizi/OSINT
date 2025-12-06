Write-Host "Checking Docker..." -ForegroundColor Cyan
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host $dockerVersion

Write-Host "`nChecking Docker daemon..." -ForegroundColor Cyan
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait for it to be ready." -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Docker is running!" -ForegroundColor Green
Write-Host "`nBuilding and starting containers..." -ForegroundColor Cyan
docker-compose up --build

