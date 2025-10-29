# 部署脚本使用说明

本文件夹包含一键部署脚本，可快速部署项目到 Cloudflare。

## 🚀 使用方法

### Windows 用户

1. 双击运行 `deploy.bat`
2. 按照提示操作即可

或使用命令行：

```cmd
scripts\deploy.bat
```

### Linux / Mac 用户

1. 给予执行权限：

```bash
chmod +x scripts/deploy.sh
```

2. 运行脚本：

```bash
./scripts/deploy.sh
```

或使用相对路径：

```bash
scripts/deploy.sh
```

## 📝 脚本功能

自动执行以下操作：

1. ✅ 检查 Node.js 和 npm 环境
2. ✅ 安装 Wrangler CLI
3. ✅ 登录 Cloudflare 账号
4. ✅ 创建 R2 存储桶
5. ✅ 部署 Worker
6. ✅ 部署前端到 Pages

## ⚠️ 注意事项

- 首次运行需要网络连接
- 需要 Cloudflare 账号（免费）
- 登录过程会自动打开浏览器进行授权
- 如果 R2 存储桶已存在，会显示错误但不影响后续步骤

## 🔧 手动部署

如果脚本出现问题，可以手动执行命令：

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 创建 R2 存储桶
wrangler r2 bucket create photos

# 4. 部署 Worker
wrangler deploy

# 5. 部署 Pages
npx wrangler pages deploy . --project-name=online-mirror
```

更多详情请查看项目根目录的 [README.md](../README.md)
