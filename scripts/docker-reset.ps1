param(
  [switch]$Detached,
  [switch]$NoCache,
  [switch]$RemoveVolumes,
  [switch]$RemoveAllContainers
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$composeFile = Join-Path $repoRoot "docker-compose.full.yml"

if (-not (Test-Path $composeFile)) {
  throw "Missing compose file: $composeFile"
}

Set-Location $repoRoot

function Import-EnvFile {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $name, $value = $line.Split("=", 2)
    $name = $name.Trim()
    $value = $value.Trim().Trim('"').Trim("'")

    if ($name -and -not [Environment]::GetEnvironmentVariable($name, "Process")) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

Import-EnvFile (Join-Path $repoRoot "App\shopper\.env")
Import-EnvFile (Join-Path $repoRoot "Service\Login\.env")
Import-EnvFile (Join-Path $repoRoot "Service\ItemsService\.env")

if (-not $env:NEXT_PUBLIC_GOOGLE_CLIENT_ID -and $env:GOOGLE_CLIENT_ID) {
  $env:NEXT_PUBLIC_GOOGLE_CLIENT_ID = $env:GOOGLE_CLIENT_ID
}

if (-not $env:GOOGLE_CLIENT_ID -and $env:NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  $env:GOOGLE_CLIENT_ID = $env:NEXT_PUBLIC_GOOGLE_CLIENT_ID
}

Write-Host "Stopping marketplace Docker stack..."
$downArgs = @("compose", "-f", $composeFile, "-p", "marketplace", "down", "--remove-orphans")

if ($RemoveVolumes) {
  $downArgs += "--volumes"
}

docker @downArgs

$legacyContainers = @(
  "shopper-db",
  "items-service-db",
  "seller",
  "slugmarketplace_db",
  "marketplace_items_db",
  "marketplace_login_db",
  "marketplace_items_service",
  "marketplace_login_service",
  "marketplace_shopper_service"
)

Write-Host "Removing old marketplace containers if they exist..."
foreach ($container in $legacyContainers) {
  $existingContainer = docker ps -aq --filter "name=^/$container$"

  if ($existingContainer) {
    docker rm -f $container
  }
}

if ($RemoveAllContainers) {
  Write-Host "Removing every Docker container on this machine..."
  $containers = docker ps -aq

  if ($containers) {
    docker rm -f $containers
  } else {
    Write-Host "No Docker containers to remove."
  }
}

Write-Host "Building marketplace Docker images..."
$buildArgs = @("compose", "-f", $composeFile, "-p", "marketplace", "build")

if ($NoCache) {
  $buildArgs += "--no-cache"
}

docker @buildArgs

Write-Host "Starting marketplace services..."
$upArgs = @("compose", "-f", $composeFile, "-p", "marketplace", "up")

if ($Detached) {
  $upArgs += "-d"
}

docker @upArgs
