param(
  [string]$ExtId = "jbbpipijnhljkkhdbfimmohcdjmlfcnf",
  [int]$Threads = 8,
  [int]$Port = 6806,
  [switch]$NoStart,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$root   = Split-Path -Parent $PSScriptRoot
$pclDir = Join-Path $root "pcl"
$exe    = Join-Path $pclDir "PclBridge.exe"
$cfg    = Join-Path $pclDir "bridge.json"

if (-not (Test-Path $exe)) { Write-Host ("找不到 " + $exe) -ForegroundColor Red; exit 1 }
New-Item -ItemType Directory -Force -Path $pclDir | Out-Null

function Scan-ExtId {
  $extDir = (Resolve-Path $root).Path
  $roots = @(
    (Join-Path $env:LOCALAPPDATA "Microsoft\Edge\User Data"),
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data")
  )
  foreach ($r in $roots) {
    if (-not (Test-Path $r)) { continue }
    Get-ChildItem $r -Directory -ErrorAction SilentlyContinue | ForEach-Object {
      $prof = Join-Path $_.FullName "Secure Preferences"
      if (-not (Test-Path $prof)) { $prof = Join-Path $_.FullName "Preferences" }
      if (-not (Test-Path $prof)) { return }
      try {
        $j = Get-Content $prof -Raw -ErrorAction Stop | ConvertFrom-Json
        $settings = $j.extensions.settings
        if ($settings -is [string]) { $settings = $settings | ConvertFrom-Json }
        if (-not $settings) { return }
        foreach ($id in $settings.PSObject.Properties.Name) {
          $ep = $settings.$id.path
          if ($ep -and (($ep -eq $extDir) -or ($ep -eq ($extDir + "\")))) { return $id }
        }
      } catch {}
    }
  }
  return ""
}

$scanned = Scan-ExtId
if (-not [string]::IsNullOrWhiteSpace($scanned)) {
  $ExtId = $scanned
  Write-Host ("自动识别扩展 ID: " + $scanned) -ForegroundColor Green
}
$ExtId = $ExtId.Trim()
if ($ExtId -notmatch '^[a-p]{32}$') {
  Write-Host "扩展 ID 不合法，请到 edge://extensions 复制 32 位 ID 后用 -ExtId 传入" -ForegroundColor Red
  exit 1
}

# 有下载在跑时不要强杀
$busy = 0
try {
  $st = Invoke-RestMethod ("http://127.0.0.1:" + $Port + "/status") -TimeoutSec 2
  $busy = @($st.tasks | Where-Object { $_.state -eq "downloading" -or $_.state -eq "pending" }).Count
} catch {}
if ($busy -gt 0 -and (-not $Force)) {
  Write-Host ("当前有 " + $busy + " 个下载任务在跑，已中止安装以免文件残缺") -ForegroundColor Yellow
  Write-Host "等任务结束，或加 -Force 强制安装" -ForegroundColor Yellow
  exit 2
}
Get-Process PclBridge -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 400

$manifest = @{
  name = "com.pclbridge.bridge"
  description = "PclBridge 多线程下载器"
  path = $exe
  type = "stdio"
  allowed_origins = @("chrome-extension://$ExtId/")
} | ConvertTo-Json -Depth 4
$mfPath = Join-Path $pclDir "com.pclbridge.bridge.json"
[System.IO.File]::WriteAllText($mfPath, $manifest, (New-Object System.Text.UTF8Encoding($false)))

$keys = @(
  "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\com.pclbridge.bridge",
  "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.pclbridge.bridge",
  "HKCU:\Software\Chromium\NativeMessagingHosts\com.pclbridge.bridge"
)
foreach ($key in $keys) {
  New-Item -Path $key -Force | Out-Null
  Set-Item -Path $key -Value $mfPath
}

$config = @{ exe = $exe; port = $Port; threads = $Threads; extId = $ExtId } | ConvertTo-Json
[System.IO.File]::WriteAllText($cfg, $config, (New-Object System.Text.UTF8Encoding($false)))
Set-Content -Path (Join-Path $pclDir "threads.txt") -Value $Threads -Encoding ASCII -NoNewline

Write-Host ("已安装: " + $mfPath) -ForegroundColor Green
Write-Host ("扩展 ID: " + $ExtId + "   端口: " + $Port + "   线程: " + $Threads)

if (-not $NoStart) {
  Start-Process -FilePath $exe -ArgumentList @($Port, "--threads", $Threads) -WindowStyle Hidden
  Start-Sleep -Milliseconds 1200
  try {
    $r = Invoke-RestMethod ("http://127.0.0.1:" + $Port + "/ping") -TimeoutSec 3
    Write-Host ("启动成功: " + $r.name) -ForegroundColor Green
  } catch {
    Write-Host "启动后没响应，检查端口是否被占用" -ForegroundColor Yellow
  }
}
Write-Host "重启 Edge 后生效：浏览器启动时自动拉起下载器，全部关闭后退出"
