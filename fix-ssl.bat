@echo off
REM Fix composer SSL error 60 (antivirus/proxy HTTPS inspection) and finish setup
cd /d "%~dp0"
set PATH=C:\xampp8.2\php;%PATH%

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-ssl.ps1"
if not exist cacert-all.pem (echo Could not build cacert-all.pem & pause & exit /b 1)

echo.
echo [composer] Using cacert-all.pem ...
call composer config cafile "%~dp0cacert-all.pem"
call composer install --no-interaction || (echo. & echo Composer install FAILED - send a screenshot of the lines above. & pause & exit /b 1)

echo.
echo [db] Migrating and seeding (MySQL must be running in XAMPP)...
php artisan migrate --seed --force || (echo Migration failed. Is MySQL running? Check DB_* in .env & pause & exit /b 1)
php artisan db:seed --class=DemoSeeder --force
php artisan storage:link
php artisan optimize:clear

echo.
echo ============================================================
echo  DONE. Open: http://localhost/imran/school-management-api/public/portal/
echo ============================================================
pause
