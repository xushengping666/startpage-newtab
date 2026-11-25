# 发布到 GitHub：先确保 Clash/代理已启动，且已 gh auth login
$ErrorActionPreference = "Stop"
$repo = "startpage-newtab"
$desc = "Windows 新标签页扩展：搜索/时钟/便签/Dock/壁纸 + 本地下载接管 + 音乐小组件"

Set-Location (Split-Path -Parent $PSScriptRoot)

# 自动探测常见代理端口
$proxy = $null
foreach ($p in 7897, 7890, 1080, 10809) {
  $ok = Test-NetConnection -ComputerName 127.0.0.1 -Port $p -InformationLevel Quiet -WarningAction SilentlyContinue
  if ($ok) { $proxy = "http://127.0.0.1:$p"; break }
}
if ($proxy) {
  $env:HTTPS_PROXY = $proxy; $env:HTTP_PROXY = $proxy
  Write-Host ("使用代理: " + $proxy) -ForegroundColor Green
} else {
  Write-Host "未检测到本机代理端口，若无法访问 GitHub 请先启动 Clash。" -ForegroundColor Yellow
}

& gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "尚未登录 GitHub，请先执行：" -ForegroundColor Yellow
  Write-Host "  gh auth login -h github.com -p https -w" -ForegroundColor Cyan
  exit 1
}

$exists = & gh repo view ($env:GITHUB_USER + "/" + $repo) 2>$null
if ($exists) {
  Write-Host "远程仓库已存在，直接推送..." -ForegroundColor Yellow
  git remote get-url origin 2>$null | Out-Null
  if (-not $?) { git remote add origin ("https://github.com/" + $env:GITHUB_USER + "/" + $repo + ".git") }
  git push -u origin main
} else {
  & gh repo create $repo --public --source . --remote origin --push --description $desc
}
Write-Host "完成。" -ForegroundColor Green
