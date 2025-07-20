@echo off
echo Starting Wopital Applications...
echo.

echo Starting Platform Admin (Port 3000)...
start "Platform Admin" cmd /k "cd platformAdmin && npm start"

echo Starting Hospital Admin (Port 3001)...
start "Hospital Admin" cmd /k "cd hospitalAdmin && npm start"

echo Starting Mobile App (Expo)...
start "Mobile App" cmd /k "cd patientMobileApp && npx expo start --lan"

echo.
echo All applications are starting...
echo.
echo Platform Admin: http://localhost:3000
echo Hospital Admin: http://localhost:3001
echo Mobile App: Check the Expo terminal for QR code
echo.
pause 