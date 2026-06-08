$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"
$legacyCloudflaredPath = Join-Path $projectRoot "src\Dashboard\ERP whatsapp tracking\cloudflared.exe"
$port = 4173
$localUrl = "http://localhost:$port"

Write-Host ""
Write-Host "UrBridge.ai client demo" -ForegroundColor Cyan
Write-Host "This creates a temporary public link. Keep this terminal open." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $cloudflaredPath)) {
  if (Test-Path $legacyCloudflaredPath) {
    Copy-Item -Path $legacyCloudflaredPath -Destination $cloudflaredPath
  } else {
    Write-Host "Downloading Cloudflare Tunnel..." -ForegroundColor Cyan
    Invoke-WebRequest `
      -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" `
      -OutFile $cloudflaredPath
  }
}

Set-Location $projectRoot

Write-Host "Building UrBridge.ai production demo..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Starting UrBridge.ai preview on $localUrl ..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
  param($root, $port)

  Set-Location $root
  npm run preview -- --host 0.0.0.0 --port $port --strictPort
} -ArgumentList $projectRoot, $port

try {
  $ready = $false

  for ($attempt = 1; $attempt -le 30; $attempt++) {
    Start-Sleep -Seconds 1

    if ($serverJob.State -ne "Running") {
      Receive-Job $serverJob
      throw "UrBridge.ai preview server stopped before it was ready."
    }

    try {
      $response = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 2

      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 300
    }
  }

  if (-not $ready) {
    throw "UrBridge.ai preview server did not start on $localUrl."
  }

  Write-Host ""
  Write-Host "Public UrBridge.ai link will appear below as https://....trycloudflare.com" -ForegroundColor Green
  Write-Host "Send that link to the client. Press Ctrl+C when the demo is finished." -ForegroundColor Yellow
  Write-Host ""

  & $cloudflaredPath tunnel --protocol http2 --edge-ip-version 4 --url $localUrl
} finally {
  if ($serverJob) {
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
  }
}
