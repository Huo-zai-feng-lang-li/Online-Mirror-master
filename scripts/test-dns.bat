@echo off
chcp 65001 >nul
echo ================================================
echo   DNS 解析测试脚本
echo ================================================
echo.

echo 测试域名: zk9999902.dpdns.org
echo.

echo [1] 测试 DNS 解析...
nslookup zk9999902.dpdns.org
echo.

echo [2] 测试 Cloudflare Pages 默认域名...
nslookup online-mirror.pages.dev
echo.

echo [3] 测试网络连通性...
ping -n 4 zk9999902.dpdns.org
echo.

echo [4] 测试 HTTPS 访问...
curl -I https://zk9999902.dpdns.org
echo.

echo ================================================
echo   测试完成
echo ================================================
pause

