@echo off
chcp 65001 >nul
echo ================================================
echo   部署到 Production（自定义域名）
echo ================================================
echo.

echo 🚀 步骤 1/2: 部署 Worker API...
echo.
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo ❌ Worker 部署失败
    pause
    exit /b 1
)
echo ✅ Worker API 部署成功
echo.

echo 📤 步骤 2/2: 部署前端到 Pages...
echo.
call npx wrangler pages deploy . --project-name=online-mirror --branch=production --commit-dirty=true
if %errorlevel% neq 0 (
    echo ❌ Pages 部署失败
    pause
    exit /b 1
)
echo ✅ 前端部署成功
echo.

echo ================================================
echo   ✅ 部署完成！
echo ================================================
echo.
echo 您的自定义域名将在1-5分钟内更新
echo https://zk9999902.dpdns.org
pause

