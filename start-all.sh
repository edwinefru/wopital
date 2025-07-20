#!/bin/bash

echo "========================================"
echo "   Wopital - Hospital Management System"
echo "========================================"
echo ""
echo "Starting all components..."
echo ""

echo "[1/3] Starting Platform Admin Dashboard (Port 3000)..."
cd platformAdmin && npm start &
PLATFORM_PID=$!

sleep 5

echo "[2/3] Starting Hospital Admin Dashboard (Port 3001)..."
cd ../hospitalAdmin && npm start &
HOSPITAL_PID=$!

sleep 5

echo "[3/3] Starting Patient Mobile App..."
cd ../patientMobileApp && npm start &
MOBILE_PID=$!

echo ""
echo "========================================"
echo "All components are starting..."
echo ""
echo "Platform Admin: http://localhost:3000"
echo "Hospital Admin: http://localhost:3001"
echo "Mobile App: Scan QR code with Expo Go"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all components"
echo ""

# Wait for user to stop
wait 