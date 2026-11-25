$ErrorActionPreference = "SilentlyContinue"
$root   = Split-Path -Parent $PSScriptRoot
$pclDir = Join-Path $root "pcl"
$cfg    = Join-Path $pclDir "bridge.json"
$exe    = Join-Path $pclDir "PclBridge.exe"
$port   = 6806
$idleSeconds = 20

if (Test-Path $cfg) {
  try {
    $conf = Get-Content $cfg -Raw | ConvertFrom-Json
    if ($conf.port)  { $port = [int]$conf.port }
    if ($conf.exe -and (Test-Path $conf.exe)) { $exe = $conf.exe }
  } catch {}
}
if (-not (Test-Path $exe)) { exit 1 }

$noEdgeSince = $null
function Get-Threads {
  $th = 8
  $f = Join-Path $pclDir "threads.txt"
  if (Test-Path $f) { $raw = (Get-Content $f -TotalCount 1).Trim(); if ($raw -match '^\d+$') { $th = [int]$raw } }
  if ($th -lt 1) { $th = 1 }; if ($th -gt 64) { $th = 64 }
  return $th
}
function Has-ActiveTask {
  try {
    $st = Invoke-RestMethod ("http://127.0.0.1:" + $port + "/status") -TimeoutSec 2
    $busy = @($st.tasks | Where-Object { $_.state -eq "downloading" -or $_.state -eq "pending" })
    return ($busy.Count -gt 0)
  } catch { return $false }
}

while ($true) {
  if (-not (Test-Path $exe)) { exit 1 }
  $edge = Get-Process msedge -ErrorAction SilentlyContinue
  $bridge = Get-Process PclBridge -ErrorAction SilentlyContinue
  if ($edge) {
    $noEdgeSince = $null
    if (-not $bridge) {
      Start-Process -FilePath $exe -ArgumentList @($port, "--threads", (Get-Threads)) -WindowStyle Hidden
      Start-Sleep -Seconds 3
    }
  } else {
    if ($null -eq $noEdgeSince) { $noEdgeSince = Get-Date }
    elseif (((Get-Date) - $noEdgeSince).TotalSeconds -gt $idleSeconds) {
      if (-not (Has-ActiveTask)) { if ($bridge) { Stop-Process -Name PclBridge -Force }; exit 0 }
    }
  }
  Start-Sleep -Seconds 5
}
