@echo off
echo Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking Docker daemon...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop is not running!
    echo Please start Docker Desktop and wait for it to be ready.
    echo Then run this script again.
    pause
    exit /b 1
)

echo Docker is running!
echo.
echo Building and starting containers...
docker-compose up --build

pause

