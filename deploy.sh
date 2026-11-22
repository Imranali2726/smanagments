#!/bin/bash
# AAS School Manager deploy script.
# Runs on cPanel > Git Version Control > "Deploy HEAD Commit" (see .cpanel.yml).
cd /home/pelaqspk/aas || exit 1
LOG=/home/pelaqspk/aas-deploy.log
{
echo "== deploy $(date)"
php -v | head -1
if [ "$(php -r 'echo PHP_VERSION_ID;')" -lt 80200 ]; then echo "ERROR: PHP 8.2 or newer is needed"; exit 1; fi
export COMPOSER_HOME=/home/pelaqspk/.composer
if command -v composer >/dev/null 2>&1; then
    C="composer"
else
    [ -f /home/pelaqspk/composer.phar ] || curl -sS https://getcomposer.org/installer | php -- --install-dir=/home/pelaqspk
    C="php -d memory_limit=-1 /home/pelaqspk/composer.phar"
fi
$C install --optimize-autoloader --no-interaction --no-progress
php artisan migrate --force
php artisan db:seed --force
if [ ! -f /home/pelaqspk/.aas-demo-seeded ]; then
    php artisan db:seed --class=DemoSeeder --force && touch /home/pelaqspk/.aas-demo-seeded
fi
[ -e public/storage ] || php artisan storage:link
php artisan optimize:clear
echo "== done $(date)"
} >> "$LOG" 2>&1
