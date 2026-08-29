@echo off
setlocal enabledelayedexpansion
title Tracklytics Frontend Dev Server Launcher

echo ========================================================================
echo  ✨ TRACKLYTICS REACT FRONTEND LAUNCHER
echo  PATH: %~dp0frontend
echo ========================================================================
echo.

cd /d "%~dp0frontend"

if not exist "package.json" (
    echo [ERROR] Cannot find package.json in %~dp0frontend!
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] node_modules not detected. Installing dependencies...
    call npm install
)

echo [INFO] Launching Vite development server...
echo.
call npm run dev

pause
