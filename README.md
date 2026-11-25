# StartPage · 新标签页

> 一个 Windows 下自用的浏览器新标签页扩展：搜索、时钟天气、便签、Dock、壁纸，外加 **本地下载接管** 和 **音乐小组件**。纯前端 + 一个本地 C# 小工具，无需服务器、无需账号。

![界面预览](docs/preview.png)

<p align="center">
  <img src="docs/search-focus.png" alt="搜索聚焦" width="720">
</p>

---

## 特性

### 新标签页

| 模块 | 说明 |
|---|---|
| **搜索** | 多引擎（Bing / Google / 百度 / 知乎 / 淘宝 / GitHub 等），搜索联想、搜索历史、`!前缀` 快速切换引擎 |
| **聚焦模式** | 点击搜索框时全屏虚化，只保留搜索与联想；底部显示**每日一句**（联网获取，离线自动用本地句库） |
| **时钟** | 12/24 小时、日期、农历、节气 |
| **天气** | 基于 Open-Meteo，自动定位/可手动设城市，显示今日与三日预报 |
| **便签** | 自动保存，常驻右侧，可拖动 |
| **Dock** | 快捷方式图标、拖动排序、右键菜单、磨砂玻璃质感、悬停放大 |
| **全局 Dock** | 任意网页按 `Alt + Shift + D` 或鼠标移到底部唤出 |
| **壁纸** | 静态渐变 / 动态渐变 / 图片 / 视频；支持轮播、遮罩浓度、模糊、拖拽图片或视频到页面直接应用 |
| **主题** | 深色/浅色自适应，可自定义强调色、字体、Dock 透明度 |

### 音乐小组件（Windows）

- 吸附在屏幕边缘的黑胶唱片，可拖动、可调大小（默认半藏在左侧）
- 点击唱片弹出歌曲卡片：封面、歌名、歌手、专辑、播放/暂停/上一首/下一首、进度条、音量
- 暂停时唱针抬起，播放时唱片旋转；封面主色会染到卡片与控件
- 数据来自 Windows 系统媒体会话（SMTC），兼容 SPlayer 等基于 SMTC 的播放器

> 截图里的播放器是 [SPlayer](https://github.com/imsyy/SPlayer)，本扩展只读取系统媒体会话，不依赖特定播放器。

### 下载接管（Windows，可选）

- 浏览器下载改为交给本地 `PclBridge.exe`：**HTTP Range 多线程分段下载**（1–64 线程）
- 支持进度、速度、暂停/继续、删除；完成后自动落盘到指定目录
- 通过 Chrome 原生消息（Native Messaging）自动拉起，Edge/Chrome/Chromium 通用

---

## 安装

### 方式一：一键安装（推荐）

1. 解压发布包
2. 双击 **`一键安装.bat`**，它会：
   - 复制文件到 `%LOCALAPPDATA%\StartPage`
   - 注册下载器原生宿主（可选功能才会用到）
   - 在桌面创建带 `--load-extension` 的快捷方式
   - 自动打开 `edge://extensions` 与安装目录
3. 在 `edge://extensions` 打开右上角 **开发人员模式**
4. 点 **加载解压缩的扩展**，选择脚本弹出的目录
5. 以后从桌面快捷方式启动即可

### 方式二：手动加载

```
edge://extensions  →  开发人员模式  →  加载解压缩的扩展  →  选择本仓库根目录
```

Chrome 同理（`chrome://extensions`）。

### 可选：注册下载器宿主

```powershell
# 在仓库根目录执行（不需要管理员）
powershell -NoProfile -ExecutionPolicy Bypass -File tools\install-host.ps1

# 卸载注册
powershell -NoProfile -ExecutionPolicy Bypass -File tools\uninstall-host.ps1
```

安装完 **完全关闭浏览器**（任务管理器确认没有 `msedge.exe` / `chrome.exe`）再打开，宿主才会被重新拉起。

> 发布包里的 `pcl\PclBridge.exe` 是编译好的宿主；从源码构建见下文。

---

## 使用

### 快捷键

| 按键 | 作用 |
|---|---|
| `/` | 聚焦搜索框 |
| `Alt + Shift + D` | 唤出/收起全局 Dock（任意网页） |
| `数字 1–9` | 打开对应顺序的快捷方式 |
| `Esc` | 关闭设置面板 / 清空搜索框 |

### 搜索前缀

在搜索框输入 `!g 关键词` 可临时切换引擎：

```
!g   Google      !b   Bing        !bd  百度
!z   知乎        !tb  淘宝        !gh  GitHub
```

### 壁纸

- 设置 → **背景与壁纸** → 模式选「图片」→ 选择图片
- 或直接把图片/视频 **拖到页面上**
- 或把文件命名为 `bg.mp4` / `bg.jpg` 放进扩展目录
- 支持轮播：添加多张图片，设置切换间隔

### 音乐小组件

- 位置/大小：设置 → 组件 → 音乐，拖动唱片可改位置（靠近边缘自动吸附），滑杆调大小
- 卡片：点击唱片弹出；点击空白处 / 移开鼠标 2.5 秒后收起
- 靠屏幕右侧时会自动把卡片翻到左边

---

## 目录结构

```
StartPage/
├─ manifest.json              # MV3 清单
├─ index.html                 # 新标签页（内联样式 + 结构）
├─ app.js                     # 核心：搜索 / 壁纸 / Dock / 便签 / 主题 / 设置面板
├─ extra.js                   # 扩展功能：天气、农历、音乐组件、轮播、全局 Dock 注入等
├─ background.js              # Service Worker：下载拦截、原生消息、通知
├─ dock.css / dock.js         # 全局浮动 Dock（Shadow DOM 注入任意页面）
├─ icon*.png                  # 图标
├─ bg.mp4                     # （可选）视频壁纸，自行放置，不随仓库提供
├─ pcl/
│  ├─ PclBridge.exe           # （构建产物）原生宿主，不随仓库提供
│  └─ com.pclbridge.bridge.json  # 安装脚本生成
├─ tools/
│  ├─ setup.ps1               # 一键安装：复制 + 注册 + 快捷方式
│  ├─ install-host.ps1        # 注册原生宿主
│  ├─ install-watch.ps1       # 开机守护（可选）
│  ├─ watch-guard.ps1         # 守护进程
│  ├─ uninstall-host.ps1      # 卸载注册
│  └─ PclBridge/              # 宿主源码（C# / .NET 8）
└─ docs/                      # 截图
```

---

## 构建原生宿主

需要 **.NET 8 SDK**（Windows）。

```powershell
cd tools\PclBridge

dotnet publish -c Release -r win-x64 --self-contained false `
  -p:PublishSingleFile=true -o ..\..\pcl
```

产物约 24 MB（包含 WinRT 投影，用于读取系统媒体会话）。

之后运行 `tools\install-host.ps1` 注册即可。

### 宿主接口

宿主在 `127.0.0.1:6806` 提供本地 HTTP 接口（仅本机可访问）：

| 接口 | 说明 |
|---|---|
| `GET /ping` | 存活检查、当前线程数、下载目录 |
| `GET /status` | 任务列表（进度、速度、线程数） |
| `GET /add?url=&name=` | 新建下载任务 |
| `GET /pause\|resume\|remove?id=` | 任务控制 |
| `GET /nowplaying` | 当前系统媒体会话（歌名/歌手/专辑/进度/封面） |
| `GET /media?action=prev\|playpause\|next\|seek&pos=` | 媒体控制，优先走 SMTC |
| `GET /cover` | 当前封面图（JPEG） |
| `GET /volume` / `?set=0-100` | 读取/设置系统主音量 |

---

## 数据存储

| 数据 | 位置 |
|---|---|
| 设置（壁纸模式、快捷方式、主题等） | `localStorage["startpage.v2"]` |
| 图片壁纸 / 视频壁纸 / 轮播图 | IndexedDB `startpage` → object store `assets` |
| 每日一句缓存 | `localStorage["spQuoteDaily2"]` |
| 下载任务 | 宿主内存 + 浏览器下载目录 |

---

## 隐私

- 所有设置与壁纸都**只存在本机**，不上传任何数据
- 本地宿主只监听 `127.0.0.1`，不对外网开放
- 会联网的只有：天气（Open-Meteo）、每日一句（今日诗词 API）、搜索联想（对应搜索引擎）
- 不需要登录，不收集统计

---

## 已知限制

| 项 | 说明 |
|---|---|
| **歌词** | 系统媒体会话不提供歌词。需要给播放器开远程调试端口读取，暂未实现 |
| **一言 API** | 部分网络下 `hitokoto.cn` 不可达，故使用今日诗词 + 本地 60 句兜底 |
| **多线程内存** | 分段下载会把每段缓存在内存，文件越大峰值内存越高；建议 16–32 线程 |
| **仅 Windows** | 音乐组件、下载接管依赖 Windows SMTC / .NET 原生宿主；纯前端部分在 macOS/Linux 的 Chrome 下也可用 |
| **Edge 限制** | 浏览器不允许脚本静默安装扩展，「加载解压缩」需手动点一次 |

---

## 常见问题

**Q：壁纸选完变成渐变 / 刷新后消失？**
A：多半是 IndexedDB 版本冲突或存储配额问题。现版本已做自动升版 + Blob 存储 + 失败重试；仍异常时打开 设置 → 背景与壁纸 → **存储自检**，把提示内容提 issue。

**Q：切换窗口时壁纸闪一下？**
A：旧版用 `<img>` 显示壁纸，切窗会重新解码。现改为 `#stage` 的 `background-image` 绘制，已修复。

**Q：音乐组件不显示？**
A：确认宿主在运行（`curl http://127.0.0.1:6806/ping` 有返回），且播放器通过系统媒体会话播放（Windows 音量浮窗里能看到曲目）。

**Q：下载很慢 / 线程数不生效？**
A：检查 `/ping` 返回的 `threads`；线程数需服务器支持 Range，否则自动回退单流。走代理时过多连接反而变慢。

---

## 贡献

欢迎 issue / PR。改动前建议先跑一遍：

```powershell
node --check app.js
node --check extra.js
node --check background.js
node --check dock.js
```

---

## License

[MIT](LICENSE)
