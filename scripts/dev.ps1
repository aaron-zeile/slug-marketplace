param(
  [switch]$NoStart
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$containerNames = @(
  "app",
  "postgres",
  "marketplace_shopper_service",
  "marketplace_items_service",
  "marketplace_login_service",
  "marketplace_items_db",
  "items-service-db",
  "cart-service-db"
)

Write-Host "Stopping old marketplace Docker containers..."
foreach ($containerName in $containerNames) {
  $containerId = docker ps -aq --filter "name=^/$containerName$" 2>$null

  if ($containerId) {
    docker rm -f $containerName | Out-Null
    Write-Host "Removed container $containerName"
  }
}

$ports = @(3000, 3002, 3010, 4000, 4010, 4500, 4600)
$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue
$processIds = $connections |
  Select-Object -ExpandProperty OwningProcess -Unique |
  Where-Object { $_ -and $_ -ne $PID }

if ($processIds) {
  Write-Host "Stopping processes using marketplace ports..."
  foreach ($processId in $processIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

    if ($process) {
      Write-Host "Stopping $($process.ProcessName) (PID $processId)"
      Stop-Process -Id $processId -Force
    }
  }
} else {
  Write-Host "No local processes are using marketplace ports."
}

if ($NoStart) {
  Write-Host "Cleanup complete."
  exit 0
}

Write-Host "Starting databases (login-db, items-db, cart-db)..."
docker compose -f Service/Login/docker-compose.yml up -d login-db
docker compose -f Service/ItemsService/docker-compose.yml up -d postgres
docker compose -f Service/Cart/docker-compose.yml up -d postgres

Write-Host "Starting marketplace (admin, seller, shopper, ItemsService, Cart, Login)..."
& npm.cmd run dev:local
