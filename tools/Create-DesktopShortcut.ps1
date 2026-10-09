<#
.SYNOPSIS
    Creates a Desktop shortcut for the Frida-Toolkit environment setup script.

.DESCRIPTION
    Run this single script (do not paste its contents line-by-line into
    Windows PowerShell console host — multi-line paste there can reorder
    lines). Example:

        & "C:\Users\Haley\Frida-Toolkit\tools\Create-DesktopShortcut.ps1"
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $repoRoot "tools\Setup-Frida-Toolkit-Environment.bat"

if (-not (Test-Path $target)) {
    throw "Setup script not found at $target. Make sure this script is run from inside the Frida-Toolkit repo's tools folder."
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Frida-Toolkit Setup.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = Join-Path $repoRoot "tools"
$shortcut.WindowStyle = 1
$shortcut.Description = "Install Frida-Toolkit Android/iOS dev environment (CMake, NDK, drivers, pymobiledevice3, Frida)"
$shortcut.IconLocation = "shell32.dll,165"
$shortcut.Save()

if (Test-Path $shortcutPath) {
    Write-Host "Shortcut created: $shortcutPath" -ForegroundColor Green
} else {
    throw "Shortcut creation failed."
}
