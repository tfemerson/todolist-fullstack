@echo off
chcp 65001 >nul
REM Windows Batch Startup Script

echo Starting Todo List Full Stack Application...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed, please install Docker Desktop first
    pause
    exit /b 1
)

REM Check if Docker Compose is installed  
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker Compose is not installed, please install Docker Compose first
        pause
        exit /b 1
    )
)

REM Create environment files if they don't exist
if not exist backend\.env (
    echo Creating backend environment file...
    copy backend\.env.template backend\.env >nul 2>&1
    echo Backend .env file created successfully
)

if not exist .env (
    echo Creating frontend environment file...
    copy .env.template .env >nul 2>&1  
    echo Frontend .env file created successfully
)

REM Stop existing containers if any
echo Stopping existing containers...
docker-compose down >nul 2>&1

REM Build and start services
echo Building and starting services...
docker-compose up --build -d

REM Wait for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo Checking service status...
docker-compose ps

echo.
echo Application started successfully!
echo Frontend URL: http://localhost:3100
echo Backend API URL: http://localhost:8000  
echo API Documentation: http://localhost:8000/docs
echo Database Connection: mongodb://localhost:27017
echo.
echo Common Commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo.
pause
