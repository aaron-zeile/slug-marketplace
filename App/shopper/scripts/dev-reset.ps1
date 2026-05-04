$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $appRoot

Write-Host "Stopping and removing all Docker containers..."
$containers = docker ps -aq

if ($containers) {
  docker rm -f $containers
} else {
  Write-Host "No Docker containers to remove."
}

Write-Host "Starting shopper Docker services..."
docker compose up -d

Write-Host "Stopping existing shopper Next dev server if one is running..."
$nextLock = Join-Path $appRoot ".next\dev\lock"

if (Test-Path $nextLock) {
  $lockContent = Get-Content $nextLock -Raw

  if ($lockContent -match "PID:\s*(\d+)") {
    $nextPid = [int]$Matches[1]
    $process = Get-Process -Id $nextPid -ErrorAction SilentlyContinue

    if ($process) {
      Stop-Process -Id $nextPid -Force
      Write-Host "Stopped Next dev server PID $nextPid."
    }
  }
}

Write-Host "Starting shopper dev server..."
npm run dev
