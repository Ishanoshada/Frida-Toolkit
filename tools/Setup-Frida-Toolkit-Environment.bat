@echo off
REM Launches setup-environment.ps1 with an admin prompt so driver/winget installs succeed.
REM Double-click this file (or its desktop shortcut) to run the full environment setup.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -NoExit -File \"%~dp0setup-environment.ps1\"' -Verb RunAs"
