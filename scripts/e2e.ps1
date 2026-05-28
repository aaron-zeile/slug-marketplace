param(
  [switch]$SkipBuild,
  [switch]$StopPortProcesses,
  [switch]$UseDev
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

function Assert-PortsAvailable {
  param([int[]]$Ports)

  $blockedPorts = @()
  foreach ($port in $Ports) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listeners) {
      $owners = $listeners |
        Select-Object -ExpandProperty OwningProcess -Unique |
        ForEach-Object {
          $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
          if ($process) {
            "$($process.ProcessName) (pid $($_))"
          } else {
            "pid $_"
          }
        }

      $blockedPorts += "${port}: $($owners -join ', ')"
    }
  }

  if ($blockedPorts.Count -gt 0) {
    throw "Required e2e port(s) are already in use: $($blockedPorts -join '; ')"
  }
}

function Stop-PortProcesses {
  param([int[]]$Ports)

  $processIds = Get-NetTCPConnection -LocalPort $Ports -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -and $_ -ne $PID }

  if (-not $processIds) {
    return
  }

  Write-Host "Stopping processes using e2e ports..."
  foreach ($processId in $processIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
      Write-Host "Stopping $($process.ProcessName) (PID $processId)"
      Stop-Process -Id $processId -Force
    }
  }
}

function Stop-DevStack {
  param(
    [System.Diagnostics.Process]$Process,
    [int[]]$Ports
  )

  if ($Process -and -not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }

  Stop-PortProcesses -Ports $Ports
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

$env:E2E_MOCK_GOOGLE_CREDENTIAL = "e2e-google-token"
$devPorts = @(3000, 3002, 3010, 4000, 4010, 4500, 4600, 4700, 5173)

if ($UseDev) {
  $env:E2E_SELLER_URL = "http://localhost:5173"

  if ($StopPortProcesses) {
    Stop-PortProcesses -Ports $devPorts
  }

  Write-Host "Starting dev stack for e2e..."
  $devProcess = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev") `
    -WorkingDirectory $repoRoot `
    -WindowStyle Hidden `
    -PassThru

  try {
    Write-Host "Waiting for seller server on localhost:3010..."
    Wait-ForTcpPort -HostName "localhost" -Port 3010

    Write-Host "Waiting for login service on localhost:4010..."
    Wait-ForTcpPort -HostName "localhost" -Port 4010

    Write-Host "Waiting for items service on localhost:4500..."
    Wait-ForTcpPort -HostName "localhost" -Port 4500

    Write-Host "Waiting for cart service on localhost:4600..."
    Wait-ForTcpPort -HostName "localhost" -Port 4600

    Write-Host "Waiting for order service on localhost:4700..."
    Wait-ForTcpPort -HostName "localhost" -Port 4700

    Write-Host "Waiting for shopper app on http://localhost:3000..."
    Wait-ForHttp -Url "http://localhost:3000"

    Write-Host "Running e2e tests..."
    & npx.cmd vitest run e2e --pool=threads --no-file-parallelism --testTimeout=20000
    $testExitCode = $LASTEXITCODE
  } finally {
    Write-Host "Stopping dev stack..."
    Stop-DevStack -Process $devProcess -Ports $devPorts
  }

  exit $testExitCode
}

@(
  "app",
  "postgres",
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

$e2ePorts = @(3000, 3002, 3010, 4010, 4700, 5433)
if ($StopPortProcesses) {
  Stop-PortProcesses -Ports $e2ePorts
}
Assert-PortsAvailable -Ports $e2ePorts

Write-Host "Starting Docker containers for e2e..."
$composeArgs = @("compose", "up", "--force-recreate", "-d")
if ($SkipBuild) {
  $composeArgs += "--no-build"
} else {
  $composeArgs += "--build"
}
Invoke-Checked -Command "docker" -Arguments $composeArgs

Write-Host "Waiting for Postgres on localhost:5433..."
Wait-ForTcpPort -HostName "localhost" -Port 5433

Write-Host "Waiting for shopper app on http://localhost:3000..."
Wait-ForHttp -Url "http://localhost:3000"

Write-Host "Running e2e tests..."
& npx.cmd vitest run e2e --pool=threads --no-file-parallelism --testTimeout=20000
exit $LASTEXITCODE
