// API 配置示例 - 请复制此文件为 config.js 并修改为您的实际配置
// 版本 1.0.1

// 将下面的 URL 替换为您的 Cloudflare Worker URL
const API_BASE_URL = "https://online-mirror.YOUR_ACCOUNT_ID.workers.dev";

// 短链接服务配置（已废弃，保留用于兼容）
const SHORT_LINK_API = "https://9lnk.io/create";

// 导出配置到全局
window.API_CONFIG = {
  BASE_URL: API_BASE_URL,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  PHOTOS: `${API_BASE_URL}/api/photos`,
  DELETE_PHOTOS: `${API_BASE_URL}/api/photos`,
  SHORT_LINK: SHORT_LINK_API,
};

// 调试输出（生产环境可移除）
console.log("✅ API Config 加载成功:", window.API_CONFIG);
