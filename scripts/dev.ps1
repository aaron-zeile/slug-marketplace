param(
  [switch]$NoStart
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$containerNames = @(
  "app",
  "postgres",
  "slugmarketplace_db",
  "seller",
  "marketplace_shopper_service",
  "marketplace_items_service",
  "marketplace_login_service",
  "marketplace_login_db",
  "marketplace_items_db",
  "items-service-db",
  "cart-service-db",
  "order-service-db"
)

Write-Host "Stopping old marketplace Docker containers..."
foreach ($containerName in $containerNames) {
  $containerId = docker ps -aq --filter "name=^/$containerName$" 2>$null

  if ($containerId) {
    docker rm -f $containerName | Out-Null
    Write-Host "Removed container $containerName"
  }
}

$ports = @(3000, 3002, 3010, 4000, 4010, 4500, 4600, 4700, 5173)
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

Write-Host "Starting databases (admin-db, seller-db, login-db, items-db, cart-db)..."
$adminEnvFile = Join-Path $repoRoot "App\admin\.env"
if (-not (Test-Path $adminEnvFile)) {
  $adminEnvFile = Join-Path $repoRoot "App\admin\.env.example"
}
docker compose --env-file $adminEnvFile -f App/admin/docker-compose.yml up -d db

Write-Host "Applying admin DB (admindb) schema and seed data..."
$adminDatabasesSql = Join-Path $repoRoot "App\admin\db\databases.sql"
$adminDbSql = @(
  (Join-Path $repoRoot "App\admin\db\schema.sql"),
  (Join-Path $repoRoot "App\admin\db\data.sql")
)
$prevErrorAction = $ErrorActionPreference
$hadNativeCmdPref = Test-Path variable:PSNativeCommandUseErrorActionPreference
if ($hadNativeCmdPref) {
  $prevNativeCmdErrors = $PSNativeCommandUseErrorActionPreference
}
try {
  if ($hadNativeCmdPref) {
    $PSNativeCommandUseErrorActionPreference = $false
  }
  $ErrorActionPreference = 'Continue'
  Get-Content $adminDatabasesSql |
    Where-Object { $_ -notmatch '^\s*\\c\s' } |
    docker exec -i slugmarketplace_db psql -q -U postgres -d postgres 2>&1 |
    Out-Null
  foreach ($sqlFile in $adminDbSql) {
    Get-Content $sqlFile |
      Where-Object { $_ -notmatch '^\s*\\c\s' } |
      docker exec -i slugmarketplace_db psql -q -U postgres -d admindb 2>&1 |
      Out-Null
  }
} finally {
  if ($hadNativeCmdPref) {
    $PSNativeCommandUseErrorActionPreference = $prevNativeCmdErrors
  }
  $ErrorActionPreference = $prevErrorAction
}
docker compose --env-file App/seller/.env -f App/seller/docker-compose.yml up -d postgres
docker compose -f Service/Login/docker-compose.yml up -d login-db

Write-Host "Applying Login account DB migrations (shipping_address)..."
$migrateSql = Join-Path $repoRoot "Service\Login\sql\migrate-shipping-address.sql"
$prevErrorAction = $ErrorActionPreference
$hadNativeCmdPref = Test-Path variable:PSNativeCommandUseErrorActionPreference
if ($hadNativeCmdPref) {
  $prevNativeCmdErrors = $PSNativeCommandUseErrorActionPreference
}
try {
  if ($hadNativeCmdPref) {
    $PSNativeCommandUseErrorActionPreference = $false
  }
  $ErrorActionPreference = 'Continue'
  Get-Content $migrateSql |
    docker exec -i marketplace_login_db psql -q -U postgres -d account 2>&1 |
    Out-Null
} finally {
  if ($hadNativeCmdPref) {
    $PSNativeCommandUseErrorActionPreference = $prevNativeCmdErrors
  }
  $ErrorActionPreference = $prevErrorAction
}
docker compose -f Service/ItemsService/docker-compose.yml up -d postgres
docker compose -f Service/Cart/docker-compose.yml up -d postgres
docker compose -f Service/Order/docker-compose.yml up -d postgres

Write-Host "Starting marketplace (admin, seller, shopper, ItemsService, Cart, Order, Login)..."
& npm.cmd run dev:local
