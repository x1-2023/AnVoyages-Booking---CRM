param(
  [switch]$SkipServers,
  [switch]$DevFrontend
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendLog = Join-Path $root "backend-server.log"
$backendErr = Join-Path $root "backend-server.err.log"
$frontendLog = Join-Path $root "frontend-server.log"
$frontendErr = Join-Path $root "frontend-server.err.log"
$tunnelLog = Join-Path $root "cloudflared-travel.log"
$tunnelErr = Join-Path $root "cloudflared-travel.err.log"
$tunnelPid = Join-Path $root ".cloudflared-travel.pid"

function Stop-PortListener {
  param([int]$Port)

  Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object State -eq Listen |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

function Stop-TravelTunnel {
  if (-not (Test-Path $tunnelPid)) {
    return
  }

  $pidValue = Get-Content $tunnelPid -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($pidValue -and ($pidValue -as [int])) {
    $process = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -eq "cloudflared") {
      Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
  }

  Remove-Item $tunnelPid -Force -ErrorAction SilentlyContinue
}

$token = $env:ANVOYAGES_CLOUDFLARED_TOKEN
if (-not $token) {
  $token = [Environment]::GetEnvironmentVariable("ANVOYAGES_CLOUDFLARED_TOKEN", "User")
}

if (-not $token) {
  throw "Missing ANVOYAGES_CLOUDFLARED_TOKEN. Set it in User environment before starting the tunnel."
}

if (-not $SkipServers) {
  Stop-PortListener -Port 3000
  Stop-PortListener -Port 8080
  Start-Sleep -Seconds 2

  Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" `
    -ArgumentList @("run", "start:prod") `
    -WorkingDirectory (Join-Path $root "backend") `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendErr `
    -WindowStyle Hidden

  if ($DevFrontend) {
    Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" `
      -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "8080") `
      -WorkingDirectory $root `
      -RedirectStandardOutput $frontendLog `
      -RedirectStandardError $frontendErr `
      -WindowStyle Hidden
  } else {
    Push-Location $root
    try {
      & "C:\Program Files\nodejs\npm.cmd" run build
      if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed."
      }
    } finally {
      Pop-Location
    }

    Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" `
      -ArgumentList @("run", "preview", "--", "--host", "0.0.0.0", "--port", "8080") `
      -WorkingDirectory $root `
      -RedirectStandardOutput $frontendLog `
      -RedirectStandardError $frontendErr `
      -WindowStyle Hidden
  }
}

Stop-TravelTunnel
Start-Sleep -Seconds 2

$process = Start-Process -FilePath "cloudflared" `
  -ArgumentList @("tunnel", "run", "--token", $token) `
  -WorkingDirectory $root `
  -RedirectStandardOutput $tunnelLog `
  -RedirectStandardError $tunnelErr `
  -WindowStyle Hidden `
  -PassThru

Set-Content -Path $tunnelPid -Value $process.Id

Write-Host "Started An Voyages dev stack."
Write-Host "Frontend/API: https://travel.0xit.me"
Write-Host "Sepay IPN: https://travel.0xit.me/api/bookings/sepay/ipn?secret=<IPN_SECRET_TRONG_ADMIN_SETTINGS>"
