# Wopital - Healthcare Management System

A comprehensive healthcare management platform with mobile apps for patients, hospital administrators, and platform administrators.

## 🏥 Project Overview

Wopital is a multi-tenant healthcare management system that includes:

- **Patient Mobile App** - React Native app for patients to manage appointments, prescriptions, and health records
- **Hospital Admin Dashboard** - Web dashboard for hospital administrators
- **Platform Admin Dashboard** - Web dashboard for system administrators
- **Supabase Backend** - PostgreSQL database with real-time features

## 📱 Apps

### Patient Mobile App (`patientMobileApp/`)
- React Native with Expo
- Patient authentication and profile management
- Appointment booking and management
- Prescription viewing
- Vitals tracking
- Emergency contacts

### Hospital Admin Dashboard (`hospitalAdmin/`)
- React web application
- Patient management
- Appointment scheduling
- Billing management
- Medical records

### Platform Admin Dashboard (`platformAdmin/`)
- React web application
- Hospital approval and management
- System-wide user management
- Subscription management
- Transaction history

## 🗄️ Database Schema

The system uses Supabase (PostgreSQL) with the following main tables:

- `patients` - Patient profiles and information
- `appointments` - Appointment scheduling
- `prescriptions` - Medication prescriptions
- `patient_vitals` - Health vitals tracking
- `diagnoses` - Medical diagnoses
- `hospitals` - Hospital information
- `doctors` - Doctor profiles
- `medications` - Medication database

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Wopital
   ```

2. **Setup Supabase**
   - Create a new Supabase project
   - Run the SQL scripts in `sharedResources/supabase/` in order
   - Update environment variables in each app

3. **Setup Patient Mobile App**
   ```bash
   cd patientMobileApp
   npm install
   cp env.example .env
   # Update .env with your Supabase credentials
   npx expo start --lan
   ```

4. **Setup Hospital Admin Dashboard**
   ```bash
   cd hospitalAdmin
   npm install
   cp env.example .env
   # Update .env with your Supabase credentials
   npm start
   ```

5. **Setup Platform Admin Dashboard**
   ```bash
   cd platformAdmin
   npm install
   cp env.example .env
   # Update .env with your Supabase credentials
   npm start
   ```

## 🔧 Environment Variables

Each app needs these environment variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Scripts

Important SQL scripts in `sharedResources/supabase/`:

- `complete_database_setup.sql` - Complete database schema
- `add_test_data_for_existing_patient.sql` - Test data for development
- `disable_rls_temporarily.sql` - Fix for RLS recursion issues

## 🛠️ Development

### Running the Apps

**Patient Mobile App:**
```bash
cd patientMobileApp
npx expo start --lan
```

**Hospital Admin:**
```bash
cd hospitalAdmin
npm start
```

**Platform Admin:**
```bash
cd platformAdmin
npm start
```

### Database Management

- Use Supabase Dashboard for database management
- SQL scripts are in `sharedResources/supabase/`
- Test data scripts for development

## 🔒 Security

- Row Level Security (RLS) policies for data protection
- Authentication via Supabase Auth
- Environment variables for sensitive data

## 📝 Testing

Test accounts:
- Patient: `test1@wopital.com` / `Test123!`
- Admin accounts can be created via platform admin

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software developed by Chenations LLC.

## 👨‍💻 Developer

**Edwin C F** - Chenations LLC

---

**Note:** This is a development version. For production deployment, ensure proper security configurations and environment setup. 