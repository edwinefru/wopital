#!/bin/bash

echo "🚀 DigiCare Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Requirements check passed!"
}

# Deploy Mobile App
deploy_mobile_app() {
    print_status "Deploying Mobile App..."
    
    cd DigiCare/mobile-app/DigiCareApp
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build APK
    print_status "Building APK..."
    if command -v eas &> /dev/null; then
        eas build --platform android --profile preview
    else
        print_warning "EAS CLI not found. Installing..."
        npm install -g @expo/eas-cli
        eas build --platform android --profile preview
    fi
    
    print_status "Mobile app build completed!"
    cd ../../..
}

# Deploy Web Dashboard
deploy_web_dashboard() {
    print_status "Deploying Web Dashboard..."
    
    cd DigiCare/web-dashboard
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod
    else
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        vercel --prod
    fi
    
    print_status "Web dashboard deployed!"
    cd ../..
}

# Deploy Admin Dashboard
deploy_admin_dashboard() {
    print_status "Deploying Admin Dashboard..."
    
    cd DigiCare/admin-dashboard/DigiCare/web-dashboard
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod
    else
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        vercel --prod
    fi
    
    print_status "Admin dashboard deployed!"
    cd ../../../..
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    
    # Check requirements
    check_requirements
    
    # Ask user what to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "1. Mobile App (APK)"
    echo "2. Web Dashboard"
    echo "3. Admin Dashboard"
    echo "4. All of the above"
    echo "5. Exit"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_mobile_app
            ;;
        2)
            deploy_web_dashboard
            ;;
        3)
            deploy_admin_dashboard
            ;;
        4)
            deploy_mobile_app
            deploy_web_dashboard
            deploy_admin_dashboard
            ;;
        5)
            print_status "Deployment cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            exit 1
            ;;
    esac
    
    print_status "Deployment completed successfully!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Download APK from EAS Build dashboard"
    echo "2. Install APK on your Android device"
    echo "3. Test all features"
    echo "4. Share web dashboard URLs with your team"
}

# Run main function
main 