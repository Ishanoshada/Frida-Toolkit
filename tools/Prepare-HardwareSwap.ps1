<#
.SYNOPSIS
    Prepares this laptop's Windows install, SSD, and RAM for a move into an
    ASUS VivoBook F1504ZA (Intel 12th gen, 1x M.2 2280 PCIe 3.0 x4, 8GB
    soldered + 1x DDR4 SO-DIMM slot).

.DESCRIPTION
    Run from an elevated PowerShell. It:
      - reports the installed RAM/SSD and whether they fit the ASUS
      - turns off Fast Startup/hibernation (a hibernated Windows disk moved
        to another machine can be corrupted)
      - reports BitLocker/device encryption and backs up recovery keys
      - optionally decrypts the drive (-DecryptBitLocker)
      - pre-installs Intel RST/VMD storage drivers into Windows when a
        driver folder is supplied, so the drive boots even if the ASUS
        firmware has VMD enabled (otherwise: INACCESSIBLE_BOOT_DEVICE)
    It never repartitions or formats anything.

.PARAMETER VmdDriverPath
    Folder containing the extracted Intel RST/VMD driver (.inf files) from
    https://www.asus.com/supportonly/f1504za/helpdesk_download/
    Defaults to <script drive>\Drivers\IntelVMD if present.

.PARAMETER KeyBackupPath
    Where BitLocker recovery key text files are written. Default: your
    Documents folder (not removable media). Treat these files as secrets.

.PARAMETER DecryptBitLocker
    Starts decryption of the system drive if encryption is on.
#>
[CmdletBinding()]
param(
    [string]$VmdDriverPath,
    [string]$KeyBackupPath = [Environment]::GetFolderPath('MyDocuments'),
    [switch]$DecryptBitLocker
)

$ErrorActionPreference = 'Stop'

function Write-Step($t) { Write-Host ""; Write-Host "==> $t" -ForegroundColor Cyan }

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Run this from an elevated (Administrator) PowerShell." -ForegroundColor Red
    exit 1
}

Write-Step "Hardware compatibility with ASUS VivoBook F1504ZA"
$ramOk = $true
Get-CimInstance Win32_PhysicalMemory | ForEach-Object {
    $gb = [math]::Round($_.Capacity / 1GB)
    $isDdr4 = ($_.SMBIOSMemoryType -eq 26)
    $isSodimm = ($_.FormFactor -eq 12) -or ($_.PartNumber -match '^(M471|HMA\w+S|KVR\w+S|CT\w+S)')
    $line = "RAM: $gb GB, $($_.ConfiguredClockSpeed) MT/s, $($_.Manufacturer) $($_.PartNumber.Trim())"
    if ($isDdr4 -and $isSodimm) {
        Write-Host "$line -> DDR4 SO-DIMM, compatible" -ForegroundColor Green
    } else {
        Write-Host "$line -> NOT confirmed DDR4 SO-DIMM, do not install" -ForegroundColor Red
        $ramOk = $false
    }
}
Write-Host "The ASUS has ONE SO-DIMM slot (8GB soldered); use a single stick, 8GB gives 16GB total." -ForegroundColor Yellow

Get-PhysicalDisk | Where-Object BusType -eq 'NVMe' | ForEach-Object {
    Write-Host "SSD: $($_.FriendlyName), $([math]::Round($_.Size/1GB)) GB, NVMe -> fits the M.2 2280 PCIe slot if the drive is 2280 length (check the label)." -ForegroundColor Green
}
if (-not (Get-PhysicalDisk | Where-Object BusType -eq 'NVMe')) {
    Write-Host "No NVMe SSD found; SATA M.2 or 2.5-inch drives do NOT fit the ASUS." -ForegroundColor Red
}

Write-Step "Turning off Fast Startup / hibernation"
powercfg /h off
Write-Host "Done. Shut down fully (Shift+Shutdown or Restart then power off) before removing parts." -ForegroundColor Green

Write-Step "BitLocker / device encryption"
$drive = $env:SystemDrive
$status = (manage-bde -status $drive) -join "`n"
if ($status -match 'Protection Status:\s+Protection On' -or $status -match 'Conversion Status:\s+(Fully Encrypted|Encryption in Progress)') {
    Write-Host "$drive is encrypted. Without the recovery key the data is lost after a hardware move." -ForegroundColor Yellow
    $out = Join-Path $KeyBackupPath "BitLocker-recovery-$($env:COMPUTERNAME).txt"
    (manage-bde -protectors -get $drive) | Set-Content -Path $out -Encoding UTF8
    Write-Host "Recovery key info saved to $out (keep it private, delete it after use)." -ForegroundColor Yellow
    if ($DecryptBitLocker) {
        manage-bde -off $drive
        Write-Host "Decryption started. Wait until 'manage-bde -status' shows Fully Decrypted before moving the SSD." -ForegroundColor Yellow
    } else {
        Write-Host "Re-run with -DecryptBitLocker to decrypt first (recommended before moving the SSD)." -ForegroundColor Yellow
    }
} else {
    Write-Host "$drive is not encrypted. Good." -ForegroundColor Green
}

Write-Step "Intel RST/VMD storage driver"
if (-not $VmdDriverPath) {
    $guess = Join-Path (Split-Path -Qualifier $PSScriptRoot) "Drivers\IntelVMD"
    if (Test-Path $guess) { $VmdDriverPath = $guess }
}
if ($VmdDriverPath -and (Test-Path $VmdDriverPath)) {
    pnputil /add-driver (Join-Path $VmdDriverPath "*.inf") /subdirs /install
    Write-Host "Driver staged in the Windows driver store." -ForegroundColor Green
} else {
    Write-Host "No driver folder given. Download the Intel RST/VMD driver for the F1504ZA from" -ForegroundColor Yellow
    Write-Host "https://www.asus.com/supportonly/f1504za/helpdesk_download/ , extract it into" -ForegroundColor Yellow
    Write-Host "<USB>\Drivers\IntelVMD and re-run this script. Without it, if the ASUS boots with" -ForegroundColor Yellow
    Write-Host "VMD on you may get INACCESSIBLE_BOOT_DEVICE (fix: turn VMD off in ASUS UEFI)." -ForegroundColor Yellow
}

Write-Step "Windows activation"
cscript //nologo "$env:SystemRoot\System32\slmgr.vbs" /xpr
Write-Host "A Lenovo OEM license can fail on different hardware; sign in with your Microsoft account to re-activate." -ForegroundColor Yellow

Write-Step "Checklist"
$finalStatus = (manage-bde -status $drive) -join "`n"
$safeToMove = ($finalStatus -match 'Fully Decrypted') -and ($finalStatus -notmatch 'Decryption in Progress')
if ($safeToMove) {
    Write-Host "SAFE TO MOVE: $drive is fully decrypted." -ForegroundColor Green
} else {
    Write-Host "NOT SAFE TO MOVE YET: $drive is not fully decrypted. Re-run until it shows Fully Decrypted." -ForegroundColor Red
}
Write-Host "Note: confirm the SSD's length (2280) on its label; software cannot detect it."
Write-Host "1. Back up important files off this drive first."
Write-Host "2. Shut down fully, unplug power, hold power button 10s."
Write-Host "3. On the ASUS: unplug AC, disconnect/disable battery per the service guide, use an ESD strap."
Write-Host "4. Fit ONE SO-DIMM and the M.2 2280 SSD (screw it down), close, boot."
if (-not $ramOk) { Write-Host "Warning: RAM compatibility not confirmed above." -ForegroundColor Red }
