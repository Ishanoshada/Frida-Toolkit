<#
.SYNOPSIS
    Opens an SSH-over-USB session to an already-jailbroken iOS device.

.DESCRIPTION
    Jailbreaking itself (checkra1n, palera1n, etc.) is a device-side/
    macOS-or-Linux operation and is not performed by this script. This script
    covers the client-side half of the workflow once a device is already
    jailbroken and running an SSH server (e.g. the "OpenSSH" package from
    Sileo/Cydia/Zebra):

      1. Uses pymobiledevice3's usbmux port forwarder (the same role as the
         classic libimobiledevice `iproxy` tool) to forward a local TCP port
         to the device's SSH daemon over the USB cable.
      2. Opens an `ssh` session through that forwarded port.

.PARAMETER LocalPort
    Local TCP port to forward from. Default 2222.

.PARAMETER RemotePort
    Port the device's SSH daemon listens on. Default 22.

.PARAMETER User
    SSH username. Default root (the standard jailbreak account).

.EXAMPLE
    .\ios-ssh-tunnel.ps1
    Forwards localhost:2222 -> device:22 and opens `ssh root@localhost -p 2222`.

.NOTES
    Default jailbreak credentials are root/alpine. Change the password on the
    device immediately after your first login (`passwd` as root).
#>

[CmdletBinding()]
param(
    [int]$LocalPort = 2222,
    [int]$RemotePort = 22,
    [string]$User = "root"
)

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "pymobiledevice3")) {
    Write-Host "pymobiledevice3 not found on PATH. Run tools\setup-environment.ps1 first." -ForegroundColor Red
    exit 1
}
if (-not (Test-Command "ssh")) {
    Write-Host "ssh not found on PATH. Run tools\setup-environment.ps1 first (installs the Windows OpenSSH Client)." -ForegroundColor Red
    exit 1
}

Write-Host "Forwarding localhost:$LocalPort -> device:$RemotePort over USB..." -ForegroundColor Cyan
$forwardJob = Start-Job -ScriptBlock {
    param($lp, $rp)
    pymobiledevice3 usbmux forward $lp $rp
} -ArgumentList $LocalPort, $RemotePort

Start-Sleep -Seconds 2

if ($forwardJob.State -eq 'Failed') {
    Write-Host "Port forward failed to start. Check the device is connected, unlocked, and trusted." -ForegroundColor Red
    Receive-Job -Job $forwardJob
    Remove-Job -Job $forwardJob -Force
    exit 1
}

Write-Host "Opening SSH session as $User (default jailbreak password is 'alpine' - change it on first login)." -ForegroundColor Yellow
try {
    ssh "$User@127.0.0.1" -p $LocalPort
} finally {
    Write-Host "Stopping port forward."
    Stop-Job -Job $forwardJob -ErrorAction SilentlyContinue
    Remove-Job -Job $forwardJob -Force -ErrorAction SilentlyContinue
}
