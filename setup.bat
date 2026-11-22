@echo off
REM ============================================================
REM  School Management System - one-click setup for XAMPP (Windows)
REM  Double-click this file. Safe to run again.
REM ============================================================
cd /d "%~dp0"
set PATH=C:\xampp8.2\php;C:\xampp\php;%PATH%

echo.
echo [1/6] Checking PHP and Composer...
where php >nul 2>nul || (echo PHP not found. Install XAMPP or add php to PATH. & pause & exit /b 1)
where composer >nul 2>nul || (echo Composer not found. Install it from https://getcomposer.org/Composer-Setup.exe & pause & exit /b 1)

echo.
echo [2/6] Creating .env ...
if not exist .env copy .env.example .env >nul

echo.
echo [3/6] Installing Laravel and packages (needs internet, takes a few minutes)...
call composer config cafile "%~dp0cacert.pem"
call composer install --no-interaction || (echo Composer install failed. See the message above. & pause & exit /b 1)

echo.
echo [4/6] Generating app key...
findstr /C:"APP_KEY=base64" .env >nul || php artisan key:generate --force

echo.
echo [5/6] Creating tables and demo data (database: school_management)...
php artisan migrate --seed --force || (echo Migration failed. Check DB_DATABASE / DB_USERNAME / DB_PASSWORD in .env and that MySQL is running in XAMPP. & pause & exit /b 1)
php artisan db:seed --class=DemoSeeder --force

echo.
echo [6/6] Linking uploads folder...
php artisan storage:link

echo.
echo ============================================================
echo  Setup complete!
echo  Portal:  http://localhost/imran/school-management-api/public/portal/
echo  Logins (password: password):
echo     parent@school.com   teacher1@school.com   admin@school.com
echo ============================================================
pause
