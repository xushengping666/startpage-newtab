# 兼容入口：实际安装统一走 install-host.ps1（同一路径、同一配置）
param(
  [int]$Threads = 8,
  [int]$Port = 6806,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
& (Join-Path $PSScriptRoot "install-host.ps1") -Threads $Threads -Port $Port -Force:$Force
exit $LASTEXITCODE
