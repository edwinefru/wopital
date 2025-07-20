@echo off
echo ========================================
echo    Wopital - Hospital Management System
echo ========================================
echo.
echo Starting all components...
echo.

echo [1/3] Starting Platform Admin Dashboard (Port 3000)...
start "Platform Admin" cmd /k "cd platformAdmin && npm start"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Hospital Admin Dashboard (Port 3001)...
start "Hospital Admin" cmd /k "cd hospitalAdmin && npm start"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Patient Mobile App...
start "Patient Mobile App" cmd /k "cd patientMobileApp && npm start"

echo.
echo ========================================
echo All components are starting...
echo.
echo Platform Admin: http://localhost:3000
echo Hospital Admin: http://localhost:3001
echo Mobile App: Scan QR code with Expo Go
echo ========================================
echo.
pause 