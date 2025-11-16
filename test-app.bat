@echo off
chcp 65001 >nul
REM Application Test Script

echo Testing Todo List Full Stack Application...
echo.

REM Test backend API
echo 1. Testing Backend API...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend API is responding
) else (
    echo ✗ Backend API is not responding
)

REM Test frontend
echo 2. Testing Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is responding  
) else (
    echo ✗ Frontend is not responding
)

REM Show service status
echo.
echo 3. Current Service Status:
docker-compose ps

echo.
echo 4. API Endpoints:
echo   Health Check: http://localhost:8000/health
echo   API Docs: http://localhost:8000/docs
echo   Statistics: http://localhost:8000/api/stats
echo.

echo 5. Quick Links:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Documentation: http://localhost:8000/docs
echo.

echo If all services show "Up", your application is running successfully!
pause

