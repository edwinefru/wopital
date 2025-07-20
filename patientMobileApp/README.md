# Patient Mobile App

A React Native mobile application for patients to manage their healthcare needs, appointments, and medical records.

## 🎯 Purpose

This mobile app allows patients to:
- Register and manage their profiles
- Book and manage appointments
- View prescriptions and medical records
- Track immunization history
- Make payments for services
- Access emergency contacts
- Receive notifications and reminders

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will start Expo development server and show a QR code.

## 📱 Testing Methods

### Method 1: Expo Go (Recommended)
1. **Install Expo Go** on your phone:
   - **Android:** Download from Google Play Store
   - **iOS:** Download from App Store

2. **Connect to the app:**
   - Scan the QR code with Expo Go
   - Or open Expo Go and scan manually
   - The app will load on your device

### Method 2: Android Emulator
1. **Install Android Studio**
2. **Set up an Android emulator**
3. **Run the app:**
   ```bash
   npm run android
   ```

### Method 3: iOS Simulator (Mac only)
1. **Install Xcode**
2. **Run the app:**
   ```bash
   npm run ios
   ```

## 📋 Features

### Authentication
- Patient registration and login
- Secure authentication with Supabase
- Password reset functionality
- Multi-factor authentication support

### Profile Management
- Update personal information
- Upload profile pictures
- Manage emergency contacts
- View medical history

### Appointment Booking
- Book appointments with doctors
- Select appointment types
- Choose preferred dates and times
- View appointment history
- Cancel or reschedule appointments

### Medical Records
- View prescriptions
- Access lab results
- Track immunization records
- Download medical documents

### Payments
- Process payments for services
- View payment history
- MTN Mobile Money integration
- Subscription management

### Notifications
- Appointment reminders
- Payment confirmations
- Medical updates
- Emergency alerts

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MTN_MOBILE_MONEY_API_KEY=your_mtn_api_key
APP_NAME=DigiCare
APP_VERSION=1.0.0
```

### Supabase Setup
1. Ensure patient tables are created
2. Configure authentication providers
3. Set up file storage for profile pictures
4. Configure RLS policies for patient data

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Patient registration
- [ ] Login with valid credentials
- [ ] Password reset functionality
- [ ] Logout functionality

#### Profile Management
- [ ] Update profile information
- [ ] Upload profile picture
- [ ] Add emergency contacts
- [ ] View profile details

#### Appointment Booking
- [ ] Book new appointment
- [ ] Select doctor and appointment type
- [ ] Choose date and time
- [ ] Confirm booking
- [ ] View appointment details
- [ ] Cancel appointment

#### Medical Records
- [ ] View prescriptions
- [ ] Access lab results
- [ ] Check immunization records
- [ ] Download documents

#### Payments
- [ ] Process payment
- [ ] View payment history
- [ ] Handle payment failures
- [ ] Manage subscriptions

### Device Testing
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Test on different screen sizes
- [ ] Test with different network conditions

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React Native
- **Framework:** Expo
- **Navigation:** React Navigation
- **State Management:** React Context
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage

### Project Structure
```
src/
├── screens/            # Screen components
├── components/         # Reusable components
├── contexts/          # React contexts
├── lib/              # Utility libraries
├── services/         # API services
└── assets/           # Images and static files
```

## 🚀 Deployment

### Development Build
```bash
# For Android
expo build:android

# For iOS
expo build:ios
```

### Production Build
```bash
# Build for app stores
eas build --platform all
```

### App Store Deployment
1. **Configure EAS Build**
2. **Set up app store credentials**
3. **Submit to app stores**
4. **Configure production environment**

## 🔒 Security

### Authentication
- Secure token-based authentication
- Biometric authentication support
- Session management
- Secure credential storage

### Data Protection
- End-to-end encryption
- Secure API communication
- Data privacy compliance
- Audit logging

## 📊 Analytics

### User Analytics
- App usage tracking
- Feature adoption metrics
- User engagement analytics
- Performance monitoring

### Health Analytics
- Appointment statistics
- Payment analytics
- User behavior patterns
- System performance

## 🔄 Integration

### Platform Integration
- Connects to hospital admin system
- Syncs with platform admin
- Manages subscriptions
- Handles billing

### External Integrations
- MTN Mobile Money payments
- Push notification services
- File storage systems
- Analytics platforms

## 🆘 Support

### Common Issues

#### Expo Go Connection
- Ensure phone and computer are on same network
- Try using tunnel connection
- Check firewall settings

#### Authentication Issues
- Verify Supabase credentials
- Check network connectivity
- Clear app cache

#### Payment Issues
- Verify MTN API credentials
- Check payment configuration
- Test with sandbox environment

### Getting Help
1. Check the main project README
2. Review existing issues
3. Create new issue with detailed description
4. Include device info and error logs

## 📝 Development

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test on multiple devices
4. Update documentation
5. Submit pull request

### Code Style
- Follow React Native best practices
- Use consistent formatting
- Add proper error handling
- Include loading states
- Test on multiple devices 