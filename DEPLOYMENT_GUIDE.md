# 🚀 DigiCare Cloud Deployment Guide

## Overview
This guide will help you deploy your DigiCare applications to the cloud and create standalone mobile apps.

## 📱 Part 1: Mobile App Deployment (Standalone APK/IPA)

### Option A: Using Expo EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g @expo/eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure EAS Build**
```bash
cd DigiCare/mobile-app/DigiCareApp
eas build:configure
```

4. **Create eas.json configuration**
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

5. **Build for Android (APK)**
```bash
eas build --platform android --profile preview
```

6. **Build for iOS (IPA)**
```bash
eas build --platform ios --profile preview
```

### Option B: Using Expo Classic Build

1. **Install Expo CLI**
```bash
npm install -g expo-cli
```

2. **Build APK**
```bash
expo build:android -t apk
```

3. **Build IPA**
```bash
expo build:ios
```

## 🌐 Part 2: Web Dashboard Deployment

### Option A: Vercel (Recommended for React Apps)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Web Dashboard**
```bash
cd DigiCare/web-dashboard
vercel
```

3. **Configure Environment Variables**
```bash
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

### Option B: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Deploy**
```bash
cd DigiCare/web-dashboard
npm run build
netlify deploy --prod --dir=build
```

### Option C: Heroku

1. **Install Heroku CLI**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Create Heroku app**
```bash
cd DigiCare/web-dashboard
heroku create digicare-dashboard
```

3. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🏥 Part 3: Admin Dashboard Deployment

### Deploy to Vercel

1. **Navigate to admin dashboard**
```bash
cd DigiCare/admin-dashboard/DigiCare/web-dashboard
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables**
```bash
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

## 🗄️ Part 4: Database Setup (Supabase)

### 1. Supabase Project Setup

1. **Go to https://supabase.com**
2. **Create new project**
3. **Get your credentials**
4. **Update environment variables**

### 2. Environment Variables

Create `.env` files in each project:

**Mobile App (.env)**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Web Dashboard (.env)**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📋 Part 5: Complete Deployment Checklist

### Pre-deployment
- [ ] Update all environment variables
- [ ] Test all features locally
- [ ] Update app.json with correct bundle IDs
- [ ] Generate app icons and splash screens

### Mobile App
- [ ] Build APK using EAS Build
- [ ] Download APK file
- [ ] Install on Android device
- [ ] Test all features

### Web Apps
- [ ] Deploy web dashboard to Vercel
- [ ] Deploy admin dashboard to Vercel
- [ ] Configure custom domains (optional)
- [ ] Set up SSL certificates

### Database
- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Configure Row Level Security (RLS)
- [ ] Test database connections

## 🔧 Part 6: Troubleshooting

### Common Issues

1. **Build fails**
   - Check environment variables
   - Verify dependencies are installed
   - Check for syntax errors

2. **App crashes on startup**
   - Verify Supabase connection
   - Check network permissions
   - Review console logs

3. **Database connection issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Test with Supabase dashboard

## 📱 Part 7: Installing APK on Your Phone

### Android Installation

1. **Enable Unknown Sources**
   - Go to Settings > Security
   - Enable "Unknown Sources"

2. **Install APK**
   - Download APK from EAS Build
   - Open APK file
   - Follow installation prompts

3. **Test App**
   - Open DigiCare app
   - Test login and features
   - Verify database connection

### iOS Installation

1. **TestFlight (Recommended)**
   - Upload IPA to App Store Connect
   - Invite testers via TestFlight

2. **Direct Installation**
   - Use Xcode to install on device
   - Requires Apple Developer account

## 🎯 Part 8: Production Considerations

### Security
- [ ] Use production Supabase project
- [ ] Configure proper RLS policies
- [ ] Enable authentication
- [ ] Set up monitoring

### Performance
- [ ] Optimize images and assets
- [ ] Enable caching
- [ ] Monitor app performance
- [ ] Set up error tracking

### Maintenance
- [ ] Set up automated backups
- [ ] Monitor database usage
- [ ] Update dependencies regularly
- [ ] Plan for scaling

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review console logs
3. Test with different devices
4. Contact support with specific error messages

---

**Happy Deploying! 🚀** 