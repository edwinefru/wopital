@echo off
echo ========================================
echo    Wopital - Supabase Setup Helper
echo ========================================
echo.

echo [1/3] Creating environment files...
echo.

echo Creating platformAdmin/.env...
if not exist "platformAdmin\.env" (
    copy "platformAdmin\env.example" "platformAdmin\.env"
    echo ✅ Created platformAdmin/.env
) else (
    echo ⚠️  platformAdmin/.env already exists
)

echo Creating hospitalAdmin/.env...
if not exist "hospitalAdmin\.env" (
    copy "hospitalAdmin\env.example" "hospitalAdmin\.env"
    echo ✅ Created hospitalAdmin/.env
) else (
    echo ⚠️  hospitalAdmin/.env already exists
)

echo Creating patientMobileApp/.env...
if not exist "patientMobileApp\.env" (
    copy "patientMobileApp\env.example" "patientMobileApp\.env"
    echo ✅ Created patientMobileApp/.env
) else (
    echo ⚠️  patientMobileApp/.env already exists
)

echo.
echo [2/3] Environment files created!
echo.
echo ⚠️  IMPORTANT: You need to manually edit the .env files:
echo.
echo 1. Go to https://supabase.com
echo 2. Create a new project
echo 3. Run the SQL script: sharedResources/supabase/complete_database_setup.sql
echo 4. Get your API keys from Settings > API
echo 5. Update the .env files with your actual keys
echo.

echo [3/3] Next steps:
echo.
echo 📋 Edit the .env files with your Supabase credentials
echo 🗄️  Run the database setup script in Supabase
echo 🚀 Start your applications with: npm start
echo.

pause 