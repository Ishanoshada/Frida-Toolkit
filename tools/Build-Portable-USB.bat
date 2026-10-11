@echo off
REM Double-click launcher for Create-PortableUSB.ps1 - no typing required.
REM Auto-detects a plugged-in removable (USB) drive; if more than one or
REM none is found, it asks you to type just the drive letter.
setlocal enabledelayedexpansion

echo Looking for a removable USB drive...
set "FOUND="
set "COUNT=0"
for /f "usebackq tokens=1,2" %%A in (`powershell -NoProfile -Command "Get-Volume | Where-Object DriveType -eq 'Removable' | ForEach-Object { $_.DriveLetter.ToString() + ' ' + $_.FileSystemLabel }"`) do (
    set /a COUNT+=1
    set "DRIVE_!COUNT!=%%A"
    echo   [!COUNT!] %%A: %%B
)

if "%COUNT%"=="0" (
    echo No removable drive detected. Plug in your USB drive, then press any key to re-scan.
    pause >nul
    %0
    exit /b
)

if "%COUNT%"=="1" (
    set "CHOSEN=!DRIVE_1!"
) else (
    set /p CHOICE=More than one removable drive found - type the number from the list above:
    set "CHOSEN=!DRIVE_%CHOICE%!"
)

echo.
echo Building the portable Frida-Toolkit kit on %CHOSEN%:\ ...
echo (This downloads several tools and can take a few minutes - please wait.)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Create-PortableUSB.ps1" -UsbDrive "%CHOSEN%:\"

echo.
echo Done. Press any key to close this window.
pause >nul
