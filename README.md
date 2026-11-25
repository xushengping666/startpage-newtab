# StartPage · 新标签页

Windows 下自用的浏览器新标签页：搜索、时钟天气、便签、Dock、壁纸，外加**本地多线程下载器**和**音乐小组件**。纯前端 + 一个本地小工具，无服务器、无账号、不收集数据。

![界面预览](docs/preview.png)

<p align="center">
  <img src="docs/search-focus.png" alt="搜索聚焦：背景虚化 + 每日一句" width="760">
</p>

支持 Edge / Chrome（Manifest V3，版本 ≥ 88）。

---

## 安装（3 步）

1. **解压**发布包（右键 → 全部解压，别在压缩包里直接点开）
2. 地址栏打开 **edge://extensions** → 右下角打开 **开发人员模式**
3. 点 **加载解压缩的扩展** → 选择解压出来、里面能看到 **manifest.json** 的文件夹

新开一个标签页就生效了。

> Chrome 用户把地址换成 **chrome://extensions**，步骤一样。
>
> 想省事：解压后双击 **一键安装.bat**，它会复制文件、生成桌面快捷方式，然后你只需做完上面第 2~3 步。

### 壁纸

**仓库和安装包都不带壁纸/视频**，首次打开是主题渐变，自行配置：

- 设置（右上角齿轮）→ 背景与壁纸 → 选「图片」→ 选择图片
- 或者把图片/视频直接**拖到页面上**
- 或者命名为 **bg.mp4** / **bg.jpg** 放进扩展目录

### 下载器 / 音乐组件（可选）

需要 **PclBridge.exe**（Windows 原生宿主）：

1. 双击解压目录里的 **tools\安装下载器.bat**
2. **完全关闭浏览器**（任务管理器确认没有 msedge.exe），重新打开

验证：地址栏打开 **http://127.0.0.1:6806/ping**，有 JSON 返回即正常。

- 下载器：网页下载自动进扩展面板，支持 1–64 线程分段下载
- 音乐组件：播放器（如 [SPlayer](https://github.com/imsyy/SPlayer)）放歌时，屏幕边缘出现黑胶唱片，点开有封面、控制、进度、音量

卸载注册：**tools\卸载下载器.bat**。

---

## 用法

| 操作 | 效果 |
|---|---|
| **/** | 聚焦搜索框 |
| **Alt + Shift + D** | 任意网页唤出全局 Dock |
| **1–9** | 打开对应快捷方式 |
| **!g** **!b** **!bd** **!z** **!tb** **!gh** | 临时切换搜索引擎 |
| 点击搜索框 | 全屏虚化 + 每日一句（联网失败用本地 60 句） |
| 点击唱片 | 展开歌曲卡片；拖唱片可换位置、靠边自动吸附 |

---

## 常见问题

**壁纸变成渐变 / 刷新没了？** 设置 → 背景与壁纸 → 点「存储自检」，把提示内容提 issue。

**切窗时壁纸闪一下？** 现已改为 #stage 背景绘制，旧版才有这个问题。

**音乐组件不显示？** 先确认 **127.0.0.1:6806/ping** 通，且播放器走系统媒体会话（Windows 音量浮窗能看到曲目）。

**下载慢 / 线程不生效？** 服务器需支持 Range；走代理时线程太多反而更慢，建议 16–32。

**更新后？** 扩展管理页点卡片上的「重新加载」。

---

## 引用与致谢

| 资源 | 用途 | 说明 |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | 天气 / 城市搜索 | 免费、无需 Key |
| [今日诗词](https://www.jinrishici.com/) | 每日一句 | v1.jinrishici.com |
| Bing / 百度搜索建议 | 搜索联想 | 对应官方接口 |
| [favicon.cccyun.cc](https://favicon.cccyun.cc/) | 站点图标抓取 | 图标版权归各站点 |
| [SPlayer](https://github.com/imsyy/SPlayer) | 测试用播放器 | 无代码依赖，任何支持系统媒体会话的播放器都行 |
| PCL2 | 命名与分段下载思路参考 | 无代码关联 |
| aria2 | 可选下载后端 | 默认用内置 PclBridge |

- 代码为原创，[MIT](LICENSE) 许可；第三方接口各有条款，商业使用请自行确认
- README 截图里的壁纸、插画、封面是**本地个人素材，不在仓库内**，版权归原作者

---

## 开发者

~~~
app.js         核心：搜索 / 壁纸 / Dock / 便签 / 主题 / 设置
extra.js       天气 / 农历 / 音乐组件 / 轮播 / 全局 Dock
background.js  下载拦截 / 原生消息 / 通知
dock.css dock.js  全局浮动 Dock（Shadow DOM 注入）
tools/PclBridge   宿主源码（C# / .NET 8）
~~~

构建宿主：

~~~
cd tools/PclBridge
dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ../../pcl
~~~

宿主本地接口（仅 127.0.0.1:6806）：/ping /status /add /pause|resume|remove /nowplaying /media /cover /volume

---

[MIT](LICENSE)
