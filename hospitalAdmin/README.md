# Hospital Admin Dashboard

The hospital-specific administrative interface for managing patients, appointments, and hospital operations.

## 🎯 Purpose

This dashboard is used by hospital administrators to:
- Manage patient records and information
- Schedule and manage appointments
- Handle lab results and medical records
- Manage pharmacy integrations
- Monitor hospital-specific analytics
- Handle staff and doctor management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on **http://localhost:3001**

## 📋 Features

### Patient Management
- Register new patients
- View and update patient records
- Manage patient profiles
- Track patient history
- Handle patient documents

### Appointment Management
- Schedule appointments
- Manage appointment calendar
- Handle appointment status
- Send appointment reminders
- Track appointment history

### Lab Results
- Upload lab test results
- Manage test reports
- Track result status
- Share results with patients
- Maintain result history

### Pharmacy Integration
- Manage pharmacy partnerships
- Track medication inventory
- Handle prescription fulfillment
- Monitor pharmacy performance

### Analytics Dashboard
- Hospital-specific statistics
- Patient activity metrics
- Appointment analytics
- Revenue tracking
- Performance indicators

### Staff Management
- Manage doctor profiles
- Track staff schedules
- Handle staff permissions
- Monitor staff performance

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_HOSPITAL_ID=your_hospital_id
REACT_APP_API_BASE_URL=http://localhost:3001
```

### Supabase Setup
1. Ensure hospital is registered in platform
2. Configure hospital-specific RLS policies
3. Set up authentication for hospital staff
4. Configure file storage for documents

## 🧪 Testing

### Manual Testing
1. **Authentication**
   - Test hospital staff login
   - Verify role-based access
   - Test session management

2. **Patient Management**
   - Register a new patient
   - Update patient information
   - Test patient search and filtering

3. **Appointment Management**
   - Schedule new appointments
   - Update appointment status
   - Test calendar functionality

4. **Lab Results**
   - Upload test results
   - Manage result status
   - Test file upload functionality

### Automated Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Context
- **Routing:** React Router v6
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   └── ...             # Other components
├── contexts/           # React contexts
├── lib/               # Utility libraries
├── services/          # API services
└── App.js            # Main application component
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set production environment variables
2. Configure Supabase production project
3. Set up file storage buckets
4. Configure domain and SSL

### Deployment Platforms
- **Vercel:** Recommended for React apps
- **Netlify:** Alternative option
- **AWS S3 + CloudFront:** For custom setup

## 🔒 Security

### Authentication
- Hospital staff authentication
- Role-based access control
- Multi-factor authentication
- Session management

### Data Protection
- Hospital-specific data isolation
- Patient data encryption
- HIPAA compliance measures
- Audit logging

## 📊 Monitoring

### Analytics
- Patient activity tracking
- Appointment metrics
- Staff performance
- Revenue analytics

### Logging
- User activity logs
- Error tracking
- Audit trails
- Performance monitoring

## 🔄 Integration

### Platform Integration
- Connects to platform admin system
- Syncs hospital data
- Manages subscriptions
- Handles billing

### External Integrations
- Lab result systems
- Pharmacy management
- Payment gateways
- Notification services

## 🆘 Support

For issues and questions:
1. Check the main project README
2. Review existing issues
3. Create new issue with detailed description
4. Include error logs and steps to reproduce

## 📝 Development

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

### Code Style
- Use consistent formatting
- Follow React best practices
- Add proper error handling
- Include loading states 