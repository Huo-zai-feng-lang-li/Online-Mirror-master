# 📊 项目架构图表索引

本文档汇总了所有使用 MCP Chart 工具生成的专业架构图表。

## 🎨 图表列表

### 1. 技术栈占比图

**用途**：展示项目各技术组件的使用占比

**链
接**：https://mdn.alipayobjects.com/one_clip/afts/img/FTqQQ5NqrKwAAAAASDAAAAgAoEACAQFr/original

**数据**：

- HTML/JavaScript: 40%
- Cloudflare Workers: 25%
- Cloudflare R2: 15%
- Cloudflare Pages: 15%
- 配置与部署: 5%

---

### 2. 系统架构图

**用途**：展示项目的三层架构关系

**链
接**：https://mdn.alipayobjects.com/one_clip/afts/img/XRpVRJdC12AAAAAASeAAAAgAoEACAQFr/original

**架构**：

```
Online Mirror
├── 前端层 (Cloudflare Pages)
│   ├── home.html - 生成拍照链接
│   ├── v.html - 极速拍照(10ms)
│   └── view.html - 照片查看
├── 后端层 (Cloudflare Workers)
│   └── worker.js - API 服务
└── 存储层 (Cloudflare R2)
    └── photos - 对象存储桶
```

---

### 3. 业务流程图

**用途**：展示从生成链接到拍照上传的完整用户流程

**链
接**：https://mdn.alipayobjects.com/one_clip/afts/img/fTLGQqJ7KP8AAAAARWAAAAgAoEACAQFr/original

**流程**：

1. 用户访问主页
2. 输入 ID+跳转链接
3. 生成加密链接（Base64）
4. 分享给目标
5. 目标点击链接
6. 加载 v.html
7. 请求摄像头权限
8. **10ms 极速拍照**
9. **先跳转后上传**（关键优化）
10. 跳转目标网站
11. 后台上传到 R2
12. 用户查看照片

**关键优化点**：

- ⚡ 10ms 拍照延迟
- 🚀 先跳转后上传（0 阻塞）
- 🔐 Base64 参数加密

---

### 4. 网络架构图

**用途**：展示 Cloudflare 全球网络和优化策略

**链
接**：https://mdn.alipayobjects.com/one_clip/afts/img/xeh7Tbo3wWcAAAAASQAAAAgAoEACAQFr/original

**网络层次**：

```
用户浏览器
    │
    ├──> Cloudflare CDN (HTTPS 加速)
    │    └──> Pages 静态资源
    │
    ├──> DNS 预解析 (节省 200-500ms)
    │    └──> Worker API
    │         └──> R2 存储
    │
    └──> 目标网站 (10ms 跳转)
```

**优化技术**：

- DNS 预解析 (dns-prefetch)
- 预连接 (preconnect)
- Cloudflare 全球 CDN
- HTTP/2 + HTTPS

---

### 5. 性能优化对比图

**用途**：量化展示优化前后的性能提升

**链
接**：https://mdn.alipayobjects.com/one_clip/afts/img/qqB7QbXfg_wAAAAARpAAAAgAoEACAQFr/original

**对比数据**：

| 指标     | 优化前      | 优化后       | 提升      |
| -------- | ----------- | ------------ | --------- |
| 拍照延迟 | 100ms       | 10ms         | **↓ 90%** |
| 图片大小 | 250KB (PNG) | 100KB (JPEG) | **↓ 60%** |
| URL 长度 | 150 字符    | 96 字符      | **↓ 36%** |
| DNS 解析 | 500ms       | 50ms         | **↓ 90%** |

**优化措施**：

- ⚡ 拍照延迟：从 100ms 优化到 10ms
- 🗜️ 图片压缩：PNG → JPEG (质量 0.7)
- 🔗 URL 缩短：Base64 编码优化
- 🌐 DNS 优化：预解析 + 预连接

---

## 🎯 图表使用说明

### 在 Markdown 中引用

```markdown
![图表名称](图表链接)
```

### 在 HTML 中引用

```html
<img src="图表链接" alt="图表名称" width="800" />
```

### 图表更新

如需更新图表，使用 MCP Chart 工具重新生成：

```bash
# 使用 Cursor MCP 功能
# 调用相应的图表生成工具（如 organization_chart, flow_diagram 等）
```

---

## 📝 图表生成记录

**生成日期**：2025-10-29  
**工具**：MCP Chart Server  
**格式**：PNG (托管在阿里云 CDN)  
**主题**：Default  
**尺寸**：根据内容自适应

---

## 🔗 相关文档

- [README.md](README.md) - 项目主文档
- [CHANGELOG.md](CHANGELOG.md) - 更新日志
- [.cursor/rules/](..cursor/rules/) - 项目规范

---

**注**：所有图表均使用 MCP Chart 工具自动生成，确保专业性和一致性。
