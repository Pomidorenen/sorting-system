@echo off

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: Node.js не установлен
    pause
    exit /b 1
)

echo Node.js установлен
cls

call npm install --verbose 

cls

node index.js

pause