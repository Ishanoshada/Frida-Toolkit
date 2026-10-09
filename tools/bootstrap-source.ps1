<#
    Bootstrap script: run this ONCE to create the Frida-Toolkit setup files
    and desktop shortcut. Safe to re-run.

    Usage:
        powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Haley\Frida-Toolkit\bootstrap.ps1"
#>

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot
$toolsDir = Join-Path $repoRoot "tools"

New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null

# --- setup-environment.ps1 -------------------------------------------------
$setupScript = @'
<#
.SYNOPSIS
    Installs the Android + iOS toolchain used by Frida-Toolkit (CMake, Ninja,
    Android NDK/platform-tools, OEM USB/ADB drivers, Apple device support,
    pymobiledevice3, and Frida).

.DESCRIPTION
    Safe to re-run: each step checks whether the tool is already installed
    before attempting install. Run from an elevated PowerShell prompt for
    best results (some winget packages and driver installs require admin).
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

function Write-Step($text) {
    Write-Host ""
    Write-Host "==> $text" -ForegroundColor Cyan
}

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Install-WingetPackage($id, $friendlyName, $extraArgs = @()) {
    Write-Step "Checking $friendlyName ($id)"
    $installed = winget list --id $id --accept-source-agreements 2>$null | Select-String -SimpleMatch $id
    if ($installed) {
        Write-Host "$friendlyName already installed." -ForegroundColor Green
        return
    }
    Write-Host "Installing $friendlyName..."
    winget install -e --id $id --accept-source-agreements --accept-package-agreements @extraArgs
}

# ---------------------------------------------------------------------------
# 1. Android toolchain
# ---------------------------------------------------------------------------
Write-Step "Android build & device tools"
Install-WingetPackage -id "Kitware.CMake" -friendlyName "CMake"
Install-WingetPackage -id "Ninja-build.Ninja" -friendlyName "Ninja"
Install-WingetPackage -id "Google.AndroidNDK" -friendlyName "Android NDK"
Install-WingetPackage -id "Google.PlatformTools" -friendlyName "Android Platform Tools (adb/fastboot)"

$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
if ((Test-Path $platformTools) -and ($env:Path -notlike "*$platformTools*")) {
    Write-Step "Adding platform-tools to user PATH"
    [Environment]::SetEnvironmentVariable("Path", "$env:Path;$platformTools", "User")
}

# ---------------------------------------------------------------------------
# 2. OEM USB / ADB drivers
# ---------------------------------------------------------------------------
Write-Step "OEM USB/ADB drivers"
Install-WingetPackage -id "Motorola.MotorolaDeviceManager" -friendlyName "Motorola Device Manager"
Write-Host "Samsung driver: search/install manually if needed -> winget search Samsung" -ForegroundColor Yellow
Write-Host "TCL/REVVL: no reliable standalone driver; Windows Update / generic Google ADB driver usually suffices." -ForegroundColor Yellow

# ---------------------------------------------------------------------------
# 3. iOS toolchain (Apple Devices + mobile device support services)
# ---------------------------------------------------------------------------
Write-Step "Apple device support"
Install-WingetPackage -id "9NP83LWLPZ9K" -friendlyName "Apple Devices" -extraArgs @("--source", "msstore")
Install-WingetPackage -id "Apple.AppleMobileDeviceSupport" -friendlyName "Apple Mobile Device Support"
Install-WingetPackage -id "Apple.AppleApplicationSupport.x64" -friendlyName "Apple Application Support (64-bit)"
Install-WingetPackage -id "Apple.Bonjour" -friendlyName "Bonjour"

Write-Step "Ensuring Apple Mobile Device Service is running"
$svc = Get-Service -Name "Apple Mobile Device Service" -ErrorAction SilentlyContinue
if ($svc) {
    if ($svc.Status -ne 'Running') { Start-Service -Name "Apple Mobile Device Service" }
    Write-Host "Apple Mobile Device Service status: $((Get-Service -Name 'Apple Mobile Device Service').Status)" -ForegroundColor Green
} else {
    Write-Host "Apple Mobile Device Service not found yet; it appears after Apple Mobile Device Support install/reboot." -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 4. pymobiledevice3 in an isolated Python 3.12 venv (keeps global Frida env clean)
# ---------------------------------------------------------------------------
Write-Step "pymobiledevice3 (isolated Python 3.12 venv)"
Install-WingetPackage -id "Python.Python.3.12" -friendlyName "Python 3.12"

$venvDir = "$env:LOCALAPPDATA\pymobiledevice3-venv"
if (-not (Test-Path "$venvDir\Scripts\python.exe")) {
    Write-Host "Creating venv at $venvDir"
    py -3.12 -m venv $venvDir
}
if (Test-Path "$venvDir\Scripts\python.exe") {
    & "$venvDir\Scripts\python.exe" -m pip install --upgrade pip
    & "$venvDir\Scripts\pip.exe" install pymobiledevice3
    $venvScripts = "$venvDir\Scripts"
    if ($env:Path -notlike "*$venvScripts*") {
        Write-Step "Adding pymobiledevice3 venv to user PATH"
        [Environment]::SetEnvironmentVariable("Path", "$env:Path;$venvScripts", "User")
    }
} else {
    Write-Host "Python 3.12 venv creation failed; install Python 3.12 manually and re-run." -ForegroundColor Red
}

# ---------------------------------------------------------------------------
# 5. Frida itself
# ---------------------------------------------------------------------------
Write-Step "Frida tools"
if (Test-Command "pip") {
    pip install --upgrade frida-tools frida
} else {
    Write-Host "pip not found on PATH; install Python first, then run: pip install frida-tools frida" -ForegroundColor Red
}

# ---------------------------------------------------------------------------
# 6. Verification
# ---------------------------------------------------------------------------
Write-Step "Verification"
Write-Host "cmake:" (cmake --version 2>$null | Select-Object -First 1)
Write-Host "ninja:" (ninja --version 2>$null)
Write-Host "adb devices:"; adb devices 2>$null
Write-Host "pymobiledevice3:" (pymobiledevice3 version 2>$null)
Write-Host "frida:" (frida --version 2>$null)

Write-Step "Setup complete. Reboot/restart your shell so PATH and driver changes take effect."
'@

Set-Content -Path (Join-Path $toolsDir "setup-environment.ps1") -Value $setupScript -Encoding UTF8
Write-Host "Wrote tools\setup-environment.ps1" -ForegroundColor Green

# --- Setup-Frida-Toolkit-Environment.bat -----------------------------------
$batScript = @'
@echo off
REM Launches setup-environment.ps1 with an admin prompt so driver/winget installs succeed.
REM Double-click this file (or its desktop shortcut) to run the full environment setup.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -NoExit -File \"%~dp0setup-environment.ps1\"' -Verb RunAs"
'@

Set-Content -Path (Join-Path $toolsDir "Setup-Frida-Toolkit-Environment.bat") -Value $batScript -Encoding ASCII
Write-Host "Wrote tools\Setup-Frida-Toolkit-Environment.bat" -ForegroundColor Green

# --- Desktop shortcut -------------------------------------------------------
$target = Join-Path $toolsDir "Setup-Frida-Toolkit-Environment.bat"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Frida-Toolkit Setup.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $toolsDir
$shortcut.WindowStyle = 1
$shortcut.Description = "Install Frida-Toolkit Android/iOS dev environment (CMake, NDK, drivers, pymobiledevice3, Frida)"
$shortcut.IconLocation = "shell32.dll,165"
$shortcut.Save()

if (Test-Path $shortcutPath) {
    Write-Host "Shortcut created: $shortcutPath" -ForegroundColor Green
} else {
    throw "Shortcut creation failed."
}

Write-Host ""
Write-Host "All done. Double-click 'Frida-Toolkit Setup' on your Desktop to run the installer." -ForegroundColor Cyan
