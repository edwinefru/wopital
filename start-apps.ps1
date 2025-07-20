# PowerShell Script to Start All Wopital Apps
# Run this script to start all three applications with auto-confirmation

Write-Host "Starting Wopital Applications..." -ForegroundColor Green

# Function to start an app in a new PowerShell window with auto-confirmation
function Start-App {
    param(
        [string]$AppName,
        [string]$Directory,
        [string]$Command
    )
    
    Write-Host "Starting $AppName..." -ForegroundColor Yellow
    
    # Create the PowerShell command with auto-confirmation
    $psCommand = @"
cd '$Directory'
# Set environment variable to auto-confirm prompts
`$env:CI = 'true'
`$env:EXPO_YES = 'true'
`$env:NPM_CONFIG_YES = 'true'
# Auto-confirm function for interactive prompts
function Confirm-Yes { return `$true }
# Override Read-Host to auto-confirm
function Read-Host { return 'y' }
# Start the app with auto-confirmation
$Command
"@
    
    # Start new PowerShell window with auto-confirmation
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $psCommand
    
    Write-Host "$AppName started in new window" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Get the current directory (Wopital root)
$rootDir = Get-Location

Write-Host "Root directory: $rootDir" -ForegroundColor Cyan

# Start Platform Admin with auto-confirmation
Start-App -AppName "Platform Admin" -Directory "$rootDir\platformAdmin" -Command "npm start --yes"

# Start Hospital Admin with auto-confirmation
Start-App -AppName "Hospital Admin" -Directory "$rootDir\hospitalAdmin" -Command "npm start --yes"

# Start Mobile App with auto-confirmation
Start-App -AppName "Mobile App" -Directory "$rootDir\patientMobileApp" -Command "npx expo start --tunnel --yes"

Write-Host "All apps started! Check the new PowerShell windows." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Yellow
Read-Host 