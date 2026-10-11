<#
.SYNOPSIS
    Installs the full Android + iOS + AI + Linux dev environment used by
    Frida-Toolkit: CMake, Ninja, Android NDK/platform-tools/Android Studio,
    jadx, objection, OEM USB/ADB drivers, scrcpy, Apple device support,
    pymobiledevice3, Frida, an iOS SSH-over-USB tunnel helper, Windows
    Terminal, PowerShell 7, Oh My Posh + a Nerd Font, VS Code with a curated
    extension set, free AI tooling (GitHub Copilot CLI + a local/offline
    Ollama model sized to your actual RAM), and a WSL2 + Ubuntu Linux
    toolchain, plus performance tweaks for laptops with no dedicated GPU
    such as the ASUS Vivobook 15 F1504ZA-WH52. See also
    tools\Create-PortableUSB.ps1 for a fully self-contained portable kit.

.DESCRIPTION
    Safe to re-run: each step checks whether the tool is already installed
    before attempting install. Run from an elevated PowerShell prompt for
    best results (some winget packages, driver installs, and the Defender
    exclusion/power-plan tweaks require admin).
#>

[CmdletBinding()]
param(
    # RAM threshold (GB) above which a bigger/better local AI model is pulled
    # instead of the small default. Auto-detected RAM is compared against this;
    # override with -MinRamForBigModelGB if you want a different cutoff.
    [int]$MinRamForBigModelGB = 16,

    # Every line printed is also appended here, so the full run can be
    # reviewed/shared even if the terminal window's scrollback gets lost
    # or overwritten by later commands.
    [string]$LogPath = (Join-Path $env:TEMP "frida-toolkit-setup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log")
)

$ErrorActionPreference = 'Continue'
try { Start-Transcript -Path $LogPath -Append | Out-Null } catch { }

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
# 0. Fresh Windows 11 OEM base drivers (chipset / storage / WiFi / audio / touchpad)
#    These drivers are hardware-ID-specific and change per board revision, so
#    rather than bundling a static driver file (which can silently mismatch
#    hardware and isn't appropriate to commit to a public repo), this detects
#    the OEM and installs their official driver-detector app, which pulls the
#    exact correct set for this machine, then kicks off a Windows Update
#    driver scan as a second safety net.
# ---------------------------------------------------------------------------
Write-Step "Fresh-install OEM base drivers (chipset / Intel RST / WiFi / audio / touchpad)"
$manufacturer = (Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue).Manufacturer
$model = (Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue).Model
Write-Host "Detected hardware: $manufacturer $model" -ForegroundColor Cyan
switch -Wildcard ($manufacturer) {
    "*ASUS*" {
        Install-WingetPackage -id "9N7R5S6B0ZZH" -friendlyName "MyASUS (official driver detector/installer)" -extraArgs @("--source", "msstore")
        Write-Host "Open MyASUS and run 'Update' to pull the exact chipset/Intel RST/WiFi/audio/touchpad drivers for $model." -ForegroundColor Cyan
        Write-Host "Fallback/manual driver page: https://www.asus.com/support/ -> search '$model' -> Driver & Utility." -ForegroundColor Cyan
    }
    "*Dell*" {
        Write-Host "Install Dell Command | Update from https://www.dell.com/support/kbdoc/en-us/000177325 for the correct drivers." -ForegroundColor Cyan
    }
    "*HP*" {
        Write-Host "Install HP Support Assistant from https://support.hp.com/us-en/help/hp-support-assistant for the correct drivers." -ForegroundColor Cyan
    }
    "*Lenovo*" {
        Install-WingetPackage -id "9WZDNCRFJ4MV" -friendlyName "Lenovo Vantage (official driver detector/installer)" -extraArgs @("--source", "msstore")
    }
    default {
        Write-Host "Unrecognized OEM ('$manufacturer'); check your laptop vendor's support site for chipset/storage/WiFi/audio drivers." -ForegroundColor Yellow
    }
}
try {
    Write-Host "Triggering a Windows Update driver scan (also surfaces Intel RST updates)..."
    Start-Process -FilePath "UsoClient" -ArgumentList "StartScan" -WindowStyle Hidden -ErrorAction Stop
} catch {
    Write-Host "Could not trigger UsoClient scan automatically; open Settings > Windows Update > Advanced options > Optional updates > Driver updates manually." -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 1. Android toolchain
# ---------------------------------------------------------------------------
Write-Step "Android build & device tools"
Install-WingetPackage -id "Kitware.CMake" -friendlyName "CMake"
Install-WingetPackage -id "Ninja-build.Ninja" -friendlyName "Ninja"
Install-WingetPackage -id "Google.AndroidNDK" -friendlyName "Android NDK"
Install-WingetPackage -id "Google.PlatformTools" -friendlyName "Android Platform Tools (adb/fastboot)"
Install-WingetPackage -id "Google.AndroidStudio" -friendlyName "Android Studio (full IDE + emulator/AVD manager)"
Install-WingetPackage -id "Skylot.jadx" -friendlyName "jadx (APK/DEX decompiler)"

if (Test-Command "pip") {
    Write-Step "objection (Frida-powered mobile RE toolkit)"
    pip install --upgrade objection
}

$platformTools = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
if ((Test-Path $platformTools) -and ($env:Path -notlike "*$platformTools*")) {
    Write-Step "Adding platform-tools to user PATH"
    [Environment]::SetEnvironmentVariable("Path", "$env:Path;$platformTools", "User")
}

# ---------------------------------------------------------------------------
# 2. OEM USB / ADB drivers
# ---------------------------------------------------------------------------
Write-Step "OEM USB/ADB drivers"
Install-WingetPackage -id "Google.USBDriver" -friendlyName "Google USB Driver (generic ADB/fastboot)"
Install-WingetPackage -id "Motorola.MotorolaDeviceManager" -friendlyName "Motorola Device Manager"
Install-WingetPackage -id "Genymobile.scrcpy" -friendlyName "scrcpy (Android screen mirroring/control)"
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
# 3b. iOS jailbreak SSH-over-USB tunnel support
#     Actual jailbreaking (checkra1n/palera1n) is a device-side operation
#     performed from the iPhone/iPad itself (or macOS/Linux for checkra1n)
#     and isn't a Windows package, so it isn't installed here. What this
#     section sets up is everything needed to *talk* to an already-jailbroken
#     device over SSH via USB, which is the client-side half of that workflow:
#       - Windows' built-in OpenSSH Client (ssh/scp)
#       - pymobiledevice3's usbmux port-forwarder (the same role as the
#         classic libimobiledevice `iproxy` tool), already installed in step 4
#       - tools/ios-ssh-tunnel.ps1, a helper that forwards a local port to the
#         device's SSH daemon over USB and opens the session for you
# ---------------------------------------------------------------------------
Write-Step "iOS jailbreak SSH-over-USB tunnel support"
try {
    $sshClient = Get-WindowsCapability -Online -Name "OpenSSH.Client*" -ErrorAction Stop
    if ($sshClient.State -ne 'Installed') {
        Write-Host "Installing Windows' built-in OpenSSH Client..."
        Add-WindowsCapability -Online -Name $sshClient.Name -ErrorAction Stop | Out-Null
    } else {
        Write-Host "OpenSSH Client already installed." -ForegroundColor Green
    }
} catch {
    Write-Host "Could not install OpenSSH Client automatically (needs admin); install via Settings > Optional Features > OpenSSH Client." -ForegroundColor Yellow
}
Write-Host "Jailbreak tools themselves (checkra1n.com / palera1n.com) run on-device or from macOS/Linux, not Windows." -ForegroundColor Cyan
Write-Host "Once a device is jailbroken and has an SSH server (e.g. the 'OpenSSH' Sileo/Cydia package) installed, use:" -ForegroundColor Cyan
Write-Host "  tools\ios-ssh-tunnel.ps1                 # forwards localhost:2222 -> device:22 over USB and opens ssh" -ForegroundColor Cyan
Write-Host "  Default jailbreak creds are root/alpine - CHANGE THE PASSWORD IMMEDIATELY after first login." -ForegroundColor Yellow

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
# 6. Best-in-class terminal (Windows Terminal + PowerShell 7 + prompt/fonts)
# ---------------------------------------------------------------------------
Write-Step "Modern terminal (Windows Terminal + PowerShell 7)"
Install-WingetPackage -id "Microsoft.WindowsTerminal" -friendlyName "Windows Terminal"
Install-WingetPackage -id "Microsoft.PowerShell" -friendlyName "PowerShell 7"
Install-WingetPackage -id "DEVCOM.JetBrainsMonoNerdFont" -friendlyName "JetBrainsMono Nerd Font (icons/glyphs in prompt)"
Install-WingetPackage -id "JanDeDobbeleer.OhMyPosh" -friendlyName "Oh My Posh (fast, informative shell prompt)"
if (Test-Command "oh-my-posh") {
    $profilePath = $PROFILE.CurrentUserAllHosts
    $initLine = '(& oh-my-posh init pwsh --config "$(oh-my-posh get builtin-themes --dir)\jandedobbeleer.omp.json") | Invoke-Expression'
    if (-not (Test-Path $profilePath)) { New-Item -ItemType File -Path $profilePath -Force | Out-Null }
    if ((Get-Content $profilePath -Raw -ErrorAction SilentlyContinue) -notlike "*oh-my-posh init*") {
        Add-Content -Path $profilePath -Value $initLine
        Write-Host "Added Oh My Posh init to $profilePath" -ForegroundColor Green
    }
}

# ---------------------------------------------------------------------------
# 7. Editor: VS Code + a curated extension set for Android/iOS/Frida work
# ---------------------------------------------------------------------------
Write-Step "VS Code + extensions"
Install-WingetPackage -id "Microsoft.VisualStudioCode" -friendlyName "Visual Studio Code"
if (Test-Command "code") {
    $extensions = @(
        "ms-python.python",
        "ms-vscode.cpptools",
        "github.copilot",
        "github.copilot-chat",
        "eamodio.gitlens"
    )
    foreach ($ext in $extensions) {
        Write-Host "Installing VS Code extension: $ext"
        code --install-extension $ext --force 2>$null
    }
}

# ---------------------------------------------------------------------------
# 8. Free AI assistants for the desktop/terminal
#    - GitHub Copilot CLI: free tier available with any GitHub account, cloud-backed.
#    - Ollama + an open-weight model: fully free, runs 100% offline/local, no
#      API key or ongoing cost. The model size is picked automatically based
#      on this machine's actual detected RAM rather than assumed hardware.
# ---------------------------------------------------------------------------
Write-Step "Free AI tooling"
Install-WingetPackage -id "GitHub.cli" -friendlyName "GitHub CLI"
if (Test-Command "gh") {
    Write-Host "Installing gh-copilot extension (free GitHub Copilot CLI)..."
    gh extension install github/gh-copilot 2>$null
    if ($LASTEXITCODE -ne 0) {
        gh extension upgrade github/gh-copilot 2>$null
    }
}

Install-WingetPackage -id "Ollama.Ollama" -friendlyName "Ollama (local/offline free AI runtime)"
if (Test-Command "ollama") {
    $totalRamGB = [math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue).TotalPhysicalMemory / 1GB)
    Write-Host "Detected RAM: ${totalRamGB}GB"
    if ($totalRamGB -ge $MinRamForBigModelGB) {
        # Enough headroom for a stronger coding-focused model.
        $model = "qwen2.5-coder:7b"
    } else {
        # llama3.2:3b (~2 GB) is a strong free, fully-local model that stays
        # responsive CPU-only on 8GB-class laptops with no dedicated GPU.
        $model = "llama3.2:3b"
    }
    Write-Host "Pulling $model (sized for this machine's RAM, free & fully local)..."
    ollama pull $model
} else {
    Write-Host "Ollama not on PATH yet; after install, run: ollama pull llama3.2:3b" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 9. WSL2 + Ubuntu Linux toolchain (native Linux dev environment alongside Windows)
#    `wsl --install` enables the needed Windows features, installs the WSL2
#    kernel, and installs Ubuntu in one shot on Windows 11, but the very
#    first install requires a reboot before the distro can initialize.
#    Re-run this script after that reboot to finish the Linux-side bootstrap.
# ---------------------------------------------------------------------------
Write-Step "WSL2 + Ubuntu Linux toolchain"
$wslInstalled = $false
try {
    $wslStatus = wsl --status 2>$null
    if ($LASTEXITCODE -eq 0) { $wslInstalled = $true }
} catch { $wslInstalled = $false }

$ubuntuPresent = $false
if ($wslInstalled) {
    $distros = wsl -l -q 2>$null
    if ($distros -match "Ubuntu") { $ubuntuPresent = $true }
}

if (-not $ubuntuPresent) {
    Write-Host "Installing WSL2 + Ubuntu (requires a reboot the first time)..."
    wsl --install -d Ubuntu --no-launch 2>$null
    Write-Host "WSL2/Ubuntu install kicked off. Reboot, then re-run this script to finish the Linux toolchain bootstrap." -ForegroundColor Yellow
} else {
    Write-Host "WSL2 + Ubuntu already installed; bootstrapping the Linux-side toolchain..."
    wsl --set-version Ubuntu 2 2>$null
    # Bootstrap as root so this works even before the distro's first-run
    # interactive username/password setup (OOBE) has been completed.
    $linuxBootstrap = "apt-get update && apt-get install -y build-essential cmake ninja-build python3 python3-pip python3-venv git android-tools-adb android-tools-fastboot && pip3 install --break-system-packages --upgrade frida-tools frida"
    wsl -d Ubuntu -u root -- bash -c $linuxBootstrap
    Write-Host "Linux toolchain ready inside WSL Ubuntu (build-essential, cmake, ninja, adb/fastboot, frida)." -ForegroundColor Green
    Write-Host "First time only: run 'wsl -d Ubuntu' once to finish creating your normal (non-root) Linux user account." -ForegroundColor Cyan
}

# ---------------------------------------------------------------------------
# 10. Laptop performance tweaks (low-GPU, modest-RAM laptops)
# ---------------------------------------------------------------------------
Write-Step "Performance tweaks for low-spec laptop hardware"
try {
    $repoRoot = Split-Path -Parent $PSScriptRoot
    Write-Host "Excluding repo folder from Windows Defender real-time scans (speeds up builds): $repoRoot"
    Add-MpPreference -ExclusionPath $repoRoot -ErrorAction Stop
    $sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $sdkRoot) { Add-MpPreference -ExclusionPath $sdkRoot -ErrorAction SilentlyContinue }
} catch {
    Write-Host "Could not add Defender exclusions (needs an elevated/admin shell); skipping." -ForegroundColor Yellow
}

try {
    Write-Host "Switching to the High performance power plan for faster builds/emulation."
    powercfg /setactive SCHEME_MIN 2>$null
} catch {
    Write-Host "Could not change power plan; skipping." -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 11. Verification
# ---------------------------------------------------------------------------
Write-Step "Verification"
Write-Host "cmake:" (cmake --version 2>$null | Select-Object -First 1)
Write-Host "ninja:" (ninja --version 2>$null)
Write-Host "adb devices:"; adb devices 2>$null
Write-Host "scrcpy:" (scrcpy --version 2>$null | Select-Object -First 1)
Write-Host "jadx:" (jadx --version 2>$null)
Write-Host "objection:" (objection version 2>$null)
Write-Host "ssh:" (ssh -V 2>&1 | Select-Object -First 1)
Write-Host "pymobiledevice3:" (pymobiledevice3 version 2>$null)
Write-Host "frida:" (frida --version 2>$null)
Write-Host "pwsh (PowerShell 7):" (pwsh -Command '$PSVersionTable.PSVersion' 2>$null)
Write-Host "code (VS Code):" (code --version 2>$null | Select-Object -First 1)
Write-Host "gh copilot:" (gh copilot --version 2>$null)
Write-Host "ollama:" (ollama --version 2>$null)
Write-Host "WSL Ubuntu:" (wsl -d Ubuntu -- lsb_release -d 2>$null)

Write-Step "Setup complete. Reboot/restart your shell so PATH and driver changes take effect."
Write-Host "Try the free AI tools:" -ForegroundColor Cyan
Write-Host "  gh copilot suggest `"list files recursively`"" -ForegroundColor Cyan
Write-Host "  ollama run llama3.2:3b   (or the bigger model this script picked, if any)" -ForegroundColor Cyan
Write-Host "Connect to a jailbroken iOS device over SSH:" -ForegroundColor Cyan
Write-Host "  tools\ios-ssh-tunnel.ps1" -ForegroundColor Cyan

Write-Host ""
Write-Host "Full log saved to: $LogPath" -ForegroundColor Cyan
Write-Host "(Share this file if you need help troubleshooting - it has the complete output, even if your terminal scrollback gets overwritten.)" -ForegroundColor Cyan

try { Stop-Transcript | Out-Null } catch { }
