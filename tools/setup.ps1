param(
  [string]$Target = "",
  [switch]$SkipHost,
  [switch]$NoShortcut,
  [switch]$NoLaunch,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $PSScriptRoot
if (-not $Target) { $Target = Join-Path $env:LOCALAPPDATA "StartPage" }

Write-Host "=== StartPage 一键安装 ===" -ForegroundColor Cyan
Write-Host ("源目录: " + $src)
Write-Host ("安装到: " + $Target)

# 1) 复制文件
New-Item -ItemType Directory -Force -Path $Target | Out-Null
$excludeDirs = @("bin", "obj", "out", "pub")
robocopy $src $Target /E /XD (Join-Path $src ".git") (Join-Path $src "tools\PclBridge\bin") (Join-Path $src "tools\PclBridge\obj") (Join-Path $src "tools\PclBridge\out") (Join-Path $src "tools\PclBridge\pub") /XF "*.zip" "*.log" /NFL /NDL /NJH /NJS /NP | Out-Null
if (-not (Test-Path (Join-Path $Target "manifest.json"))) { Write-Host "复制失败：缺少 manifest.json" -ForegroundColor Red; exit 1 }

# 2) 注册原生宿主（下载器 / 音乐联动）
if (-not $SkipHost) {
  try {
    & (Join-Path $Target "tools\install-host.ps1") -Force:$Force | Out-Null
    Write-Host "原生宿主已注册（下载器可用）" -ForegroundColor Green
  } catch {
    Write-Host ("原生宿主注册失败：" + $_.Exception.Message) -ForegroundColor Yellow
  }
}

# 3) 桌面快捷方式：带 --load-extension 启动，免手动加载
if (-not $NoShortcut) {
  try {
    $edge = @(
      "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
      "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $edge) { $edge = "msedge.exe" }
    $lnkPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "StartPage.lnk"
    $ws = New-Object -ComObject WScript.Shell
    $lnk = $ws.CreateShortcut($lnkPath)
    $lnk.TargetPath = $edge
    $lnk.Arguments = '--load-extension="' + $Target + '" "edge://newtab"'
    $lnk.WorkingDirectory = Split-Path $edge
    $lnk.Description = "StartPage 新标签页（自动加载扩展）"
    $lnk.Save()
    Write-Host ("桌面快捷方式已创建: " + $lnkPath) -ForegroundColor Green
  } catch { Write-Host "快捷方式创建失败（不影响使用）" -ForegroundColor Yellow }
}

# 4) 打开扩展管理页与文件夹
if (-not $NoLaunch) {
  Start-Process "msedge.exe" -ArgumentList "edge://extensions" -ErrorAction SilentlyContinue
  Start-Process "explorer.exe" -ArgumentList ('"' + $Target + '"') -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "下一步（只需一次）：" -ForegroundColor Cyan
Write-Host "  1. 在 edge://extensions 右上角打开「开发人员模式」"
Write-Host "  2. 点「加载解压缩的扩展」，选中：" -NoNewline
Write-Host (" " + $Target) -ForegroundColor Yellow
Write-Host "  3. 以后从桌面 StartPage 快捷方式启动即可自动带上扩展"
Write-Host ""
Write-Host "卸载：双击 tools\卸载下载器.bat，再删除安装目录即可"
