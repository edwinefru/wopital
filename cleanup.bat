@echo off
echo Cleaning up old project directories...

echo Removing wopital-app directory...
if exist "wopital-app" (
    rmdir /s /q "wopital-app"
    echo wopital-app removed
) else (
    echo wopital-app not found
)

echo Removing mobile-app directory...
if exist "mobile-app" (
    rmdir /s /q "mobile-app"
    echo mobile-app removed
) else (
    echo mobile-app not found
)

echo Cleanup complete!
pause 