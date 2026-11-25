param([int]$Port = 0)
$ErrorActionPreference = "Stop"
$root   = Split-Path -Parent $PSScriptRoot
$pclDir = Join-Path $root "pcl"
$cfg    = Join-Path $pclDir "bridge.json"
$exe    = Join-Path $pclDir "PclBridge.exe"

if (-not (Test-Path $exe)) { Write-Host "还没安装下载器，先运行 安装下载器.bat" -ForegroundColor Yellow; exit 1 }
if (-not (Test-Path $cfg))    { Write-Host "缺少 bridge.json，先运行 安装下载器.bat" -ForegroundColor Yellow; exit 1 }

$conf = Get-Content $cfg -Raw | ConvertFrom-Json
if ($Port -gt 0) { $conf.port = $Port }
$conf | ConvertTo-Json | Set-Content -Path $cfg -Encoding UTF8
Set-Content -Path (Join-Path $pclDir "threads.txt") -Value $conf.threads -Encoding ASCII -NoNewline

$vbs = Join-Path $pclDir "watch.vbs"
$ps1 = Join-Path $PSScriptRoot "watch-guard.ps1"
$line = 'CreateObject("WScript.Shell").Run "powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File ""' + $ps1 + '""", 0, False'
[System.IO.File]::WriteAllText($vbs, $line, (New-Object System.Text.ASCIIEncoding))

$key = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Set-ItemProperty -Path $key -Name "PclBridgeWatch" -Value ('wscript.exe "' + $vbs + '"')
Write-Host ("已安装守护：登录后自动检查，端口 " + $conf.port) -ForegroundColor Green
Write-Host '卸载：运行 tools\卸载下载器.bat'
