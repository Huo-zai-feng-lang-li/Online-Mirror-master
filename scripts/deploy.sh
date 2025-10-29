#!/bin/bash

echo "================================================"
echo "  Online Mirror - Cloudflare 一键部署脚本"
echo "================================================"
echo ""

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        return 1
    else
        echo "✅ $1 已安装"
        return 0
    fi
}

echo "📋 检查环境..."
echo ""

check_command node
NODE_INSTALLED=$?

check_command npm
NPM_INSTALLED=$?

if [ $NODE_INSTALLED -ne 0 ] || [ $NPM_INSTALLED -ne 0 ]; then
    echo ""
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo ""
echo "📦 安装 Wrangler..."
npm install -g wrangler

echo ""
echo "🔐 登录 Cloudflare..."
wrangler login

echo ""
echo "📦 创建 R2 存储桶..."
wrangler r2 bucket create photos

echo ""
echo "🚀 部署 Worker..."
wrangler deploy

echo ""
echo "📤 部署前端到 Pages..."
npx wrangler pages deploy . --project-name=online-mirror

echo ""
echo "================================================"
echo "  ✅ 部署完成！"
echo "================================================"
echo ""
echo "📝 接下来的步骤："
echo ""
echo "1. 访问你的 Pages URL 查看网站"
echo "2. 在 Cloudflare Dashboard 中配置自定义域名（可选）"
echo "3. 查看 DEPLOY.md 了解更多配置选项"
echo ""
echo "🎉 享受完全免费的云服务吧！"

