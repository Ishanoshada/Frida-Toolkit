<#
.SYNOPSIS
    Builds a fully self-contained, portable Frida-Toolkit kit on a USB drive.

.DESCRIPTION
    Copies this repo plus a portable (no-install) toolchain onto a USB drive:
      - Embeddable Python + pip, with frida-tools/frida/pymobiledevice3
        installed straight into it
      - Android platform-tools (adb/fastboot)
      - scrcpy (screen mirroring/control)
      - jadx (APK/DEX decompiler)
    Everything lives under <UsbDrive>\Frida-Toolkit-Portable and needs no
    admin rights or installer on the target machine - just plug the USB
    drive in and run Frida-Toolkit-Portable.bat.

    Caveat: OEM USB/ADB drivers for a brand-new device still generally need
    a one-time driver install on whatever host machine you plug into (see
    tools\setup-environment.ps1); the *tools* here are fully portable, but
    Windows device driver installation is not something that can live on
    a USB stick without an install step.

.PARAMETER UsbDrive
    Drive letter/root of the target USB drive, e.g. "E:\".

.PARAMETER PythonVersion
    Embeddable CPython version to bundle. Defaults to a known-good 3.12.x.

.EXAMPLE
    .\Create-PortableUSB.ps1 -UsbDrive "E:\"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$UsbDrive,

    [string]$PythonVersion = "3.12.7",

    # Every line printed is also appended here, so the full run can be
    # reviewed/shared even if the terminal window's scrollback gets lost.
    [string]$LogPath = (Join-Path $env:TEMP "frida-toolkit-portable-usb-$(Get-Date -Format 'yyyyMMdd-HHmmss').log")
)

$ErrorActionPreference = 'Stop'
try { Start-Transcript -Path $LogPath -Append | Out-Null } catch { }

function Write-Step($text) {
    Write-Host ""
    Write-Host "==> $text" -ForegroundColor Cyan
}

# Normalize so "D:", "D:\", and "D:/" all work identically - a bare drive
# letter with no backslash is a common, confusing source of "not found"
# errors since it resolves relative to that drive's current directory.
if ($UsbDrive -match '^[A-Za-z]:$') { $UsbDrive = "$UsbDrive\" }

if (-not (Test-Path $UsbDrive)) {
    Write-Host "Drive '$UsbDrive' not found. Pass the drive root, e.g. -UsbDrive 'E:\'" -ForegroundColor Red
    try { Stop-Transcript | Out-Null } catch { }
    exit 1
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$portableRoot = Join-Path $UsbDrive "Frida-Toolkit-Portable"
$toolsRoot = Join-Path $portableRoot "PortableTools"
$pythonDir = Join-Path $toolsRoot "python"
$platformToolsDir = Join-Path $toolsRoot "platform-tools"
$scrcpyDir = Join-Path $toolsRoot "scrcpy"
$jadxDir = Join-Path $toolsRoot "jadx"
$pwshDir = Join-Path $toolsRoot "pwsh"
$downloadsDir = Join-Path $env:TEMP "frida-toolkit-portable-downloads"
$pythonBuildDir = Join-Path $downloadsDir "python-build"

New-Item -ItemType Directory -Path $toolsRoot, $downloadsDir -Force | Out-Null

# ---------------------------------------------------------------------------
# 1. Copy the repo itself (skip .git and build output)
# ---------------------------------------------------------------------------
Write-Step "Copying Frida-Toolkit repo to $portableRoot\Frida-Toolkit"
robocopy $repoRoot (Join-Path $portableRoot "Frida-Toolkit") /MIR /XD ".git" "build" /NFL /NDL /NJH /NJS | Out-Null

# ---------------------------------------------------------------------------
# 2. Android platform-tools (adb/fastboot) - already a portable zip
# ---------------------------------------------------------------------------
Write-Step "Android platform-tools (adb/fastboot)"
if (-not (Test-Path (Join-Path $platformToolsDir "adb.exe"))) {
    $zip = Join-Path $downloadsDir "platform-tools.zip"
    Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $toolsRoot -Force
} else {
    Write-Host "Already present." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 3. scrcpy (screen mirroring/control) - latest GitHub release, Windows x64
# ---------------------------------------------------------------------------
Write-Step "scrcpy"
if (-not (Test-Path (Join-Path $scrcpyDir "scrcpy.exe"))) {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/Genymobile/scrcpy/releases/latest" -Headers @{ "User-Agent" = "Frida-Toolkit-Portable" }
    $asset = $release.assets | Where-Object { $_.name -match "win64.*\.zip$" } | Select-Object -First 1
    if ($asset) {
        $zip = Join-Path $downloadsDir "scrcpy.zip"
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip
        New-Item -ItemType Directory -Path $scrcpyDir -Force | Out-Null
        Expand-Archive -Path $zip -DestinationPath $scrcpyDir -Force
        # scrcpy zips contain one top-level folder; flatten it
        $inner = Get-ChildItem $scrcpyDir -Directory | Select-Object -First 1
        if ($inner) {
            Get-ChildItem $inner.FullName | Move-Item -Destination $scrcpyDir -Force
            Remove-Item $inner.FullName -Recurse -Force
        }
    } else {
        Write-Host "Could not find a win64 scrcpy release asset; skipping." -ForegroundColor Yellow
    }
} else {
    Write-Host "Already present." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 4. jadx (APK/DEX decompiler) - latest GitHub release
# ---------------------------------------------------------------------------
Write-Step "jadx"
if (-not (Test-Path (Join-Path $jadxDir "bin\jadx.bat"))) {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/skylot/jadx/releases/latest" -Headers @{ "User-Agent" = "Frida-Toolkit-Portable" }
    $asset = $release.assets | Where-Object { $_.name -match "^jadx-\d.*\.zip$" } | Select-Object -First 1
    if ($asset) {
        $zip = Join-Path $downloadsDir "jadx.zip"
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip
        New-Item -ItemType Directory -Path $jadxDir -Force | Out-Null
        Expand-Archive -Path $zip -DestinationPath $jadxDir -Force
    } else {
        Write-Host "Could not find a jadx release asset; skipping." -ForegroundColor Yellow
    }
    Write-Host "Note: jadx needs a Java runtime (JRE 11+) on the host machine to run." -ForegroundColor Yellow
} else {
    Write-Host "Already present." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 5. Embeddable, portable Python + pip + frida/pymobiledevice3
# ---------------------------------------------------------------------------
Write-Step "Portable Python $PythonVersion + frida-tools + frida + pymobiledevice3"
$pythonExe = Join-Path $pythonDir "python.exe"
$zip = Join-Path $downloadsDir "python-embed.zip"
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/$PythonVersion/python-$PythonVersion-embed-amd64.zip" -OutFile $zip
if (Test-Path $pythonBuildDir) {
    Remove-Item $pythonBuildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $pythonBuildDir -Force | Out-Null
Expand-Archive -Path $zip -DestinationPath $pythonBuildDir -Force

# Embeddable Python ships with site-packages/pip disabled by default;
# uncomment the "import site" line in the ._pth file to enable them.
$pthFile = Get-ChildItem $pythonBuildDir -Filter "python*._pth" | Select-Object -First 1
if ($pthFile) {
    (Get-Content $pthFile.FullName) -replace '^#\s*import site$', 'import site' | Set-Content $pthFile.FullName
}

$getPip = Join-Path $downloadsDir "get-pip.py"
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $getPip
$buildPythonExe = Join-Path $pythonBuildDir "python.exe"
& $buildPythonExe $getPip --no-warn-script-location
if ($LASTEXITCODE -ne 0) {
    throw "Could not bootstrap pip into the portable Python build."
}
& $buildPythonExe -m pip install --upgrade --no-warn-script-location pip setuptools wheel
if ($LASTEXITCODE -ne 0) {
    throw "Could not install pip and Python build tools."
}
& $buildPythonExe -m pip install --no-build-isolation --upgrade --no-warn-script-location frida-tools frida pymobiledevice3 objection
if ($LASTEXITCODE -ne 0) {
    throw "Could not install the portable Python packages."
}

if (Test-Path $pythonDir) {
    Remove-Item $pythonDir -Recurse -Force
}
New-Item -ItemType Directory -Path $pythonDir -Force | Out-Null
Copy-Item -Path (Join-Path $pythonBuildDir "*") -Destination $pythonDir -Recurse -Force

Remove-Item $downloadsDir -Recurse -Force -ErrorAction SilentlyContinue

# ---------------------------------------------------------------------------
# 6. Portable PowerShell 7 (nicer shell than cmd for the launcher)
# ---------------------------------------------------------------------------
Write-Step "Portable PowerShell 7"
if (-not (Test-Path (Join-Path $pwshDir "pwsh.exe"))) {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/PowerShell/PowerShell/releases/latest" -Headers @{ "User-Agent" = "Frida-Toolkit-Portable" }
    $asset = $release.assets | Where-Object { $_.name -match "-win-x64\.zip$" } | Select-Object -First 1
    if ($asset) {
        $zip = Join-Path $downloadsDir "pwsh.zip"
        New-Item -ItemType Directory -Path $downloadsDir -Force | Out-Null
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip
        New-Item -ItemType Directory -Path $pwshDir -Force | Out-Null
        Expand-Archive -Path $zip -DestinationPath $pwshDir -Force
        Remove-Item $downloadsDir -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Could not find a win-x64 PowerShell release asset; launcher will fall back to cmd." -ForegroundColor Yellow
    }
} else {
    Write-Host "Already present." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 7. Portable launcher
# ---------------------------------------------------------------------------
Write-Step "Writing launcher"
# pip's Scripts\*.exe entry points hardcode the interpreter path from build time,
# so they break once the kit lives on a different drive letter. These shims call
# the modules through the bundled python.exe relative to their own location.
$shimDir = Join-Path $toolsRoot "shims"
New-Item -ItemType Directory -Path $shimDir -Force | Out-Null
$shims = @{
    "frida"           = "frida_tools.repl"
    "frida-ps"        = "frida_tools.ps"
    "frida-trace"     = "frida_tools.tracer"
    "frida-ls-devices" = "frida_tools.lsd"
    "objection"       = "objection"
    "pymobiledevice3" = "pymobiledevice3"
}
foreach ($name in $shims.Keys) {
    $shimBody = "@echo off`r`n`"%~dp0..\python\python.exe`" -m $($shims[$name]) %*`r`n"
    Set-Content -Path (Join-Path $shimDir "$name.cmd") -Value $shimBody -Encoding ASCII
}

$launcher = @'
@echo off
setlocal
set "ROOT=%~dp0"
set "PATH=%ROOT%PortableTools\shims;%ROOT%PortableTools\python;%ROOT%PortableTools\platform-tools;%ROOT%PortableTools\scrcpy;%ROOT%PortableTools\jadx\bin;%ROOT%PortableTools\pwsh;%PATH%"
cd /d "%ROOT%Frida-Toolkit"
echo Frida-Toolkit portable environment ready: adb, scrcpy, jadx, frida, pymobiledevice3, objection
if exist "%ROOT%PortableTools\pwsh\pwsh.exe" (
    "%ROOT%PortableTools\pwsh\pwsh.exe" -NoExit -Command "Write-Host 'Frida-Toolkit portable shell ready.' -ForegroundColor Cyan"
) else (
    cmd /k
)
'@
Set-Content -Path (Join-Path $portableRoot "Frida-Toolkit-Portable.bat") -Value $launcher -Encoding ASCII

$readme = @"
# Frida-Toolkit Portable USB Kit

Everything here is self-contained and needs no admin rights or installer on
the host machine.

## Use it
Double-click ``Frida-Toolkit-Portable.bat``. It opens a shell (portable
PowerShell 7 if bundled, otherwise cmd) with these already on PATH:

- ``adb`` / ``fastboot`` (Android platform-tools)
- ``scrcpy`` (Android screen mirroring/control)
- ``jadx`` (APK/DEX decompiler - needs a Java 11+ runtime on the host)
- ``python`` with ``frida``, ``frida-tools``, ``pymobiledevice3``, and
  ``objection`` already installed

## Caveats
- A brand-new host machine may still need OEM USB/ADB drivers installed
  once to recognize an Android device (see ``tools\setup-environment.ps1``
  in the bundled repo copy). The tools above are fully portable; Windows
  device driver installation itself is not.
- jadx needs a Java runtime (JRE 11+) present on the host.
- To refresh this kit later (pull the newest tool versions), re-run
  ``tools\Create-PortableUSB.ps1 -UsbDrive "<this drive>"`` from a machine
  with internet access; it only re-downloads what's missing or outdated.
"@
Set-Content -Path (Join-Path $portableRoot "README.md") -Value $readme

Write-Step "Done"
Write-Host "Portable kit built at: $portableRoot" -ForegroundColor Green
Write-Host "On any Windows machine: double-click Frida-Toolkit-Portable.bat to get a ready shell." -ForegroundColor Cyan
Write-Host "Note: a new host machine may still need OEM USB/ADB drivers installed once to recognize a device (see tools\setup-environment.ps1)." -ForegroundColor Yellow
Write-Host "Note: jadx needs a Java runtime (JRE 11+) present on the host machine." -ForegroundColor Yellow
Write-Host "Full log saved to: $LogPath" -ForegroundColor Cyan

try { Stop-Transcript | Out-Null } catch { }
