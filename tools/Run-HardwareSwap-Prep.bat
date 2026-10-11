@echo off
rem Self-elevating helper: decrypts BitLocker (if on) and prepares for the ASUS swap.
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Prepare-HardwareSwap.ps1" -DecryptBitLocker
echo.
echo ---- Decryption status (re-run this file any time to check) ----
manage-bde -status %SystemDrive%
echo.
echo Do NOT remove the SSD until "Conversion Status" says Fully Decrypted.
pause
