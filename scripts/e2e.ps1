param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

function Invoke-Checked {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE"
  }
}

function Remove-ContainerIfPresent {
  param([string]$Name)

  $containerId = docker ps -aq --filter "name=^/$Name$" 2>$null
  if ($containerId) {
    Write-Host "Removing existing container $Name..."
    Invoke-Checked -Command "docker" -Arguments @("rm", "-f", $Name)
  }
}

function Wait-ForTcpPort {
  param(
    [string]$HostName,
    [int]$Port,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $connection = Test-NetConnection -ComputerName $HostName -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "Timed out waiting for ${HostName}:${Port}"
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Seconds 2
      continue
    }

    Start-Sleep -Seconds 2
  }

  throw "Timed out waiting for $Url"
}

if (-not $SkipBuild) {
  Write-Host "Building app and services for e2e..."
  Invoke-Checked -Command "npm.cmd" -Arguments @("run", "build")
}

@(
  "seller",
  "marketplace_shopper_service",
  "marketplace_items_service",
  "marketplace_login_service",
  "marketplace_items_db",
  "marketplace_login_db",
  "items-service-db",
  "cart-service-db"
) | ForEach-Object {
  Remove-ContainerIfPresent -Name $_
}

Write-Host "Starting Docker containers for e2e..."
$env:E2E_MOCK_GOOGLE_CREDENTIAL = "e2e-google-token"
Invoke-Checked -Command "docker" -Arguments @("compose", "up", "--build", "--force-recreate", "-d")

Write-Host "Waiting for Postgres on localhost:5433..."
Wait-ForTcpPort -HostName "localhost" -Port 5433

Write-Host "Waiting for shopper app on http://localhost:3000..."
Wait-ForHttp -Url "http://localhost:3000"

Write-Host "Running e2e tests..."
& npx.cmd vitest run e2e --pool=threads --no-file-parallelism --testTimeout=20000
exit $LASTEXITCODE
