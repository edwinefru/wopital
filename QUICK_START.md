# 🚀 Wopital Quick Start Guide

## 📱 Applications Overview

This project contains three applications:

1. **Platform Admin** - Web app for system-wide administration
2. **Hospital Admin** - Web app for individual hospital management  
3. **Mobile App** - React Native app for patients and mobile admin access

## 🎯 Quick Start

### Option 1: Start All Apps at Once
```bash
# Run the batch file (Windows)
start-all-apps.bat

# Or manually start each app
```

### Option 2: Start Apps Individually

#### Platform Admin (Port 3000)
```bash
cd platformAdmin
npm start
```
**Access:** http://localhost:3000

#### Hospital Admin (Port 3001)
```bash
cd hospitalAdmin
npm start
```
**Access:** http://localhost:3001

#### Mobile App (Expo)
```bash
cd patientMobileApp
npx expo start --lan
```
**Access:** Scan QR code with Expo Go app

## 🔐 Rate Limiting Features

All applications now include:
- ✅ **5 login attempts** per 15-minute window
- ✅ **30-minute block** after exceeding limit
- ✅ **Exponential backoff** retry mechanism
- ✅ **Visual feedback** showing remaining attempts
- ✅ **Automatic reset** on successful login

## 🎨 Branding Updates

All applications now use **"Wopital"** branding instead of "DigiCare":
- Platform Admin: "Wopital Platform Admin"
- Hospital Admin: "Wopital" 
- Mobile App: "Wopital"

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (for mobile app)
- Expo Go app (for testing mobile app)

## 🛠️ Troubleshooting

### Port Conflicts
If you get port conflicts:
- Platform Admin uses port 3000
- Hospital Admin uses port 3001
- Make sure these ports are available

### Rate Limit Issues
If you encounter "email rate limit exceeded":
- Wait 15-30 minutes for the block to expire
- Or use correct credentials to reset the counter
- The apps now handle this automatically with better UX

### Mobile App Issues
- Make sure Expo CLI is installed: `npm install -g @expo/cli`
- Install Expo Go on your mobile device
- Ensure your phone and computer are on the same network

## 🔗 Access URLs

- **Platform Admin:** http://localhost:3000
- **Hospital Admin:** http://localhost:3001  
- **Mobile App:** Scan QR code from Expo terminal

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify Supabase configuration
4. Check network connectivity 