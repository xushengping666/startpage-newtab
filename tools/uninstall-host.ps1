param([switch]$KeepFiles)
$ErrorActionPreference = "SilentlyContinue"
$root   = Split-Path -Parent $PSScriptRoot
$pclDir = Join-Path $root "pcl"

Get-Process PclBridge | Stop-Process -Force
$key = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Remove-ItemProperty -Path $key -Name "PclBridgeWatch" -ErrorAction SilentlyContinue

$vbs = Join-Path $pclDir "watch.vbs"
if (Test-Path $vbs) { Remove-Item $vbs -Force }

$hostKeys = @(
  "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\com.pclbridge.bridge",
  "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.pclbridge.bridge",
  "HKCU:\Software\Chromium\NativeMessagingHosts\com.pclbridge.bridge"
)
foreach ($k in $hostKeys) { Remove-Item $k -Recurse -Force -ErrorAction SilentlyContinue }

$mf = Join-Path $pclDir "com.pclbridge.bridge.json"
if (Test-Path $mf) { Remove-Item $mf -Force }

Write-Host "已移除：开机守护、原生宿主注册、manifest" -ForegroundColor Green
if (-not $KeepFiles) {
  Write-Host ("可手动删除的目录（保留以便回滚）：" + $pclDir)
}
