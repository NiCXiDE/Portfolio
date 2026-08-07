# Post-reboot: start Docker DB + seed portfolio content
# Run from the Portfolio repo root in PowerShell.

$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path

# 1) Start Docker Desktop if needed
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
  Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
}

# 2) Wait for engine
$deadline = (Get-Date).AddMinutes(5)
do {
  Start-Sleep -Seconds 3
  docker info 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { break }
  Write-Host "Esperando Docker..."
} while ((Get-Date) -lt $deadline)

if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker no respondió. Abrí Docker Desktop y esperá a que diga 'Running'."
  exit 1
}

# 3) MySQL + seed
Set-Location $PSScriptRoot\..
docker compose up -d
npm run db:seed
Write-Host "Listo. Reiniciá npm run dev si hacía falta."
