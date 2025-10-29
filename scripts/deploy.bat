@echo off
chcp 65001 >nul
echo ================================================
echo   Online Mirror - Cloudflare 一键部署脚本
echo ================================================
echo.

echo 📋 检查环境...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 npm
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
)

echo.
echo 📦 安装 Wrangler...
call npm install -g wrangler

echo.
echo 🔐 登录 Cloudflare...
call wrangler login

echo.
echo 📦 创建 R2 存储桶...
call wrangler r2 bucket create photos

echo.
echo 🚀 部署 Worker...
call wrangler deploy

echo.
echo 📤 部署前端到 Pages...
call npx wrangler pages deploy . --project-name=online-mirror

echo.
echo ================================================
echo   ✅ 部署完成！
echo ================================================
echo.
echo 📝 接下来的步骤：
echo.
echo 1. 访问你的 Pages URL 查看网站
echo 2. 在 Cloudflare Dashboard 中配置自定义域名（可选）
echo 3. 查看 DEPLOY.md 了解更多配置选项
echo.
echo 🎉 享受完全免费的云服务吧！
echo.
pause

