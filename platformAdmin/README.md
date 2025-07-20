# Platform Admin Dashboard

The main administrative interface for managing the entire Wopital platform, hospitals, and subscriptions.

## 🎯 Purpose

This dashboard is used by platform administrators to:
- Manage hospital registrations
- Handle subscription plans and billing
- Monitor platform-wide analytics
- Manage system settings
- Track transaction history
- Oversee multi-tenant operations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on **http://localhost:3000**

## 📋 Features

### Hospital Management
- Register new hospitals
- View all registered hospitals
- Manage hospital details
- Monitor hospital status

### Subscription Management
- Create subscription plans
- Manage hospital subscriptions
- Handle billing and payments
- Track subscription status

### Analytics Dashboard
- Platform-wide statistics
- Revenue analytics
- User activity metrics
- Performance indicators

### System Settings
- Platform configuration
- Feature toggles
- Security settings
- API management

### Transaction History
- Payment tracking
- Billing history
- Financial reports
- Audit logs

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:3000
```

### Supabase Setup
1. Create a Supabase project
2. Run the database migrations from `../supabase/`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

## 🧪 Testing

### Manual Testing
1. **Authentication**
   - Test admin login/logout
   - Verify role-based access

2. **Hospital Management**
   - Register a new hospital
   - Update hospital details
   - Test hospital status changes

3. **Subscription Management**
   - Create subscription plans
   - Assign plans to hospitals
   - Test billing workflows

4. **Analytics**
   - Verify dashboard metrics
   - Test data visualization
   - Check real-time updates

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

### Project Structure
```
src/
├── components/          # Reusable UI components
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
3. Set up CDN for static assets
4. Configure domain and SSL

### Deployment Platforms
- **Vercel:** Recommended for React apps
- **Netlify:** Alternative option
- **AWS S3 + CloudFront:** For custom setup

## 🔒 Security

### Authentication
- JWT-based authentication
- Role-based access control
- Session management
- Secure token storage

### Data Protection
- HTTPS enforcement
- Input validation
- SQL injection prevention
- XSS protection

## 📊 Monitoring

### Analytics
- User activity tracking
- Performance monitoring
- Error tracking
- Usage analytics

### Logging
- Application logs
- Error logs
- Audit trails
- Performance metrics

## 🆘 Support

For issues and questions:
1. Check the main project README
2. Review existing issues
3. Create new issue with detailed description
4. Include error logs and steps to reproduce 