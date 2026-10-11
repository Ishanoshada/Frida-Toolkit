# Lightweight checks for the tools\*.ps1 scripts: syntax, and (if a portable
# kit path is given) that every shim actually runs.
param([string]$KitRoot)

$ErrorActionPreference = 'Stop'
$fail = 0

Get-ChildItem $PSScriptRoot -Filter *.ps1 | Where-Object { $_.Name -ne 'Test-Scripts.ps1' } | ForEach-Object {
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errors) | Out-Null
    if ($errors) { Write-Host "FAIL syntax: $($_.Name)" -ForegroundColor Red; $errors | Format-List *; $fail++ }
    else { Write-Host "ok   syntax: $($_.Name)" -ForegroundColor Green }
}

if ($KitRoot) {
    foreach ($shim in 'frida', 'frida-ps', 'frida-trace', 'frida-ls-devices', 'objection', 'pymobiledevice3') {
        $cmd = Join-Path $KitRoot "PortableTools\shims\$shim.cmd"
        $verb = if ($shim -eq 'objection') { 'version' } elseif ($shim -eq 'pymobiledevice3') { '-h' } else { '--version' }
        $out = & cmd /c "`"$cmd`" $verb 2>&1"
        if ($LASTEXITCODE -eq 0) { Write-Host "ok   shim: $shim" -ForegroundColor Green }
        else { Write-Host "FAIL shim: $shim`n$out" -ForegroundColor Red; $fail++ }
    }
}

if ($fail) { exit 1 }
