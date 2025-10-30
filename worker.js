export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 图片直通端点 - 性能优化核心
    if (path.startsWith("/api/image/") && request.method === "GET") {
      return handleGetImage(request, env, corsHeaders);
    }

    if (path === "/api/upload" && request.method === "POST") {
      return handleUpload(request, env, corsHeaders);
    }

    if (path === "/api/photos" && request.method === "GET") {
      return handleGetPhotos(request, env, corsHeaders);
    }

    if (path === "/api/photos" && request.method === "DELETE") {
      return handleDeletePhotos(request, env, corsHeaders);
    }

    // 健康检查端点
    if (path === "/api/ping" || path === "/ping") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          message: "API is running",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleUpload(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { id, image, ip } = data;

    if (!id || !image) {
      return new Response(JSON.stringify({ error: "参数缺失" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = base64ToArrayBuffer(base64Data);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    const fileName = `${id}/${timestamp}.png`;

    // 并行上传图片和获取IP信息
    const uploadPromise = env.PHOTO_BUCKET.put(fileName, buffer, {
      httpMetadata: {
        contentType: "image/png",
      },
    });

    // 并行获取IP信息
    let ipPromise = Promise.resolve();
    if (ip) {
      ipPromise = getIPInfo(ip)
        .then((ipInfo) => {
          if (ipInfo) {
            const ipFileName = `${id}/${timestamp}.json`;
            return env.PHOTO_BUCKET.put(ipFileName, JSON.stringify(ipInfo), {
              httpMetadata: {
                contentType: "application/json",
              },
            });
          }
        })
        .catch((err) => {
          console.error("IP信息获取/存储失败:", err);
        });
    }

    // 等待图片和IP信息都完成
    await Promise.all([uploadPromise, ipPromise]);

    return new Response(JSON.stringify({ success: true, fileName }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("上传错误:", error);
    return new Response(JSON.stringify({ error: "上传失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// 获取IP地理位置信息（优先使用百度API，失败时使用免费API）
async function getIPInfo(ip) {
  try {
    // 首先尝试百度API
    try {
      const baiduResponse = await fetch(
        `https://qifu.baidu.com/api/v1/ip-portrait/brief-info?ip=${ip}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://qifu.baidu.com/",
          },
        }
      );

      if (baiduResponse.ok) {
        const baiduData = await baiduResponse.json();
        if (baiduData.code === 200 && baiduData.data) {
          const d = baiduData.data;
          return {
            ip: ip,
            country: d.country || "未知",
            province: d.province || null,
            city: d.city || null,
            isp: d.isp || "未知",
            scene: d.scene || null,
            security_risks: d.security_risks || null,
            risk_score: d.risk_score || null,
            query_time: new Date().toISOString(),
            source: "baidu",
          };
        }
      }
    } catch (baiduError) {
      console.log("百度API失败，使用备用API:", baiduError.message);
    }

    // 备用：使用 ip-api.com（免费，无需认证）
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "success") return null;

    return {
      ip: ip,
      country: data.country || "未知",
      province: data.regionName || null,
      city: data.city || null,
      isp: data.isp || "未知",
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      query_time: new Date().toISOString(),
      source: "ip-api",
    };
  } catch (error) {
    console.error("IP查询失败:", error);
    return null;
  }
}

// 图片直通端点 - 直接从 R2 流式传输图片
async function handleGetImage(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace("/api/image/", ""));

    console.log("请求图片 key:", key);

    const object = await env.PHOTO_BUCKET.get(key);

    console.log("R2 返回对象:", object ? "存在" : "不存在");

    if (!object) {
      return new Response(`Not Found: ${key}`, { status: 404 });
    }

    // 直接返回图片流，不需要 Base64 转换
    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        // 强缓存策略 - 24小时
        "Cache-Control": "public, max-age=86400, immutable",
        // Cloudflare CDN 缓存
        "CDN-Cache-Control": "max-age=86400",
        "Cloudflare-CDN-Cache-Control": "max-age=86400",
      },
    });
  } catch (error) {
    console.error("获取图片错误:", error);
    return new Response("Error", { status: 500 });
  }
}

async function handleGetPhotos(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "2");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID参数缺失" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listed = await env.PHOTO_BUCKET.list({
      prefix: `${id}/`,
    });

    const allPhotos = listed.objects
      .filter((obj) => obj.key.endsWith(".png"))
      .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());

    const total = allPhotos.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const pagePhotos = allPhotos.slice(startIndex, endIndex);

    // 优化：直接返回图片 URL，不再转 Base64
    // 同时尝试获取对应的IP信息
    const baseUrl = new URL(request.url).origin;
    const photos = await Promise.all(
      pagePhotos.map(async (obj) => {
        const timeStr = obj.key.split("/")[1].replace(".png", "");
        const formattedTime = formatTime(timeStr);

        // 尝试获取对应的IP信息JSON文件
        let ipInfo = null;
        try {
          const ipFileName = obj.key.replace(".png", ".json");
          const ipObject = await env.PHOTO_BUCKET.get(ipFileName);
          if (ipObject) {
            const ipData = await ipObject.text();
            ipInfo = JSON.parse(ipData);
          }
        } catch (e) {
          // IP信息不存在，忽略
        }

        return {
          url: `${baseUrl}/api/image/${encodeURIComponent(obj.key)}`,
          time: formattedTime,
          key: obj.key,
          ipInfo: ipInfo, // 包含IP信息（可能为null）
        };
      })
    );

    return new Response(
      JSON.stringify({
        photos,
        total,
        currentPage: page,
        totalPages,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // API 响应缓存 1 小时
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("获取照片错误:", error);
    return new Response(JSON.stringify({ error: "获取照片失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handleDeletePhotos(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const key = url.searchParams.get("key"); // 单张照片的key

    console.log("删除请求 - ID:", id, "Key:", key);

    if (!id) {
      return new Response(JSON.stringify({ error: "ID参数缺失" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 删除单张照片
    if (key) {
      console.log("开始删除单张照片:", key);
      
      try {
        // 验证 key 格式
        if (!key.includes('/') || !key.endsWith('.png')) {
          throw new Error(`无效的 key 格式: ${key}`);
        }

        // 删除图片文件
        await env.PHOTO_BUCKET.delete(key);
        console.log("✅ 已删除图片:", key);

        // 删除对应的IP信息JSON文件（如果存在）
        const jsonKey = key.replace(".png", ".json");
        try {
          await env.PHOTO_BUCKET.delete(jsonKey);
          console.log("✅ 已删除IP信息:", jsonKey);
        } catch (jsonError) {
          console.log("⚠️ IP信息文件不存在或删除失败:", jsonKey);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          deleted: 1,
          key: key,
          message: "照片已删除"
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (deleteError) {
        console.error("删除单张照片失败:", deleteError);
        return new Response(JSON.stringify({ 
          error: "删除失败", 
          details: deleteError.message,
          key: key
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 删除所有照片（包括图片和JSON文件）
    console.log("开始删除所有照片，ID:", id);
    
    const listed = await env.PHOTO_BUCKET.list({
      prefix: `${id}/`,
    });

    console.log("找到文件数量:", listed.objects.length);

    if (listed.objects.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        deleted: 0,
        message: "没有找到要删除的照片"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 逐个删除以确保可靠性
    let deletedCount = 0;
    for (const obj of listed.objects) {
      try {
        await env.PHOTO_BUCKET.delete(obj.key);
        deletedCount++;
        console.log("✅ 已删除:", obj.key);
      } catch (err) {
        console.error("删除失败:", obj.key, err);
      }
    }

    console.log(`✅ 删除完成，共删除 ${deletedCount}/${listed.objects.length} 个文件`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: deletedCount,
        total: listed.objects.length,
        message: `已删除 ${deletedCount} 个文件`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("删除照片错误:", error);
    return new Response(JSON.stringify({ 
      error: "删除失败", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// arrayBufferToBase64 函数已移除 - 不再需要 Base64 转换
// 图片现在通过 /api/image/ 端点直接流式传输

function formatTime(timeStr) {
  if (timeStr.length < 14) return timeStr;

  // 解析 UTC 时间字符串
  const year = timeStr.slice(0, 4);
  const month = timeStr.slice(4, 6);
  const day = timeStr.slice(6, 8);
  const hour = timeStr.slice(8, 10);
  const minute = timeStr.slice(10, 12);
  const second = timeStr.slice(12, 14);

  // 创建 UTC Date 对象
  const utcDate = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
  );

  // 转换为北京时间（GMT+8）
  const beijingTime = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);

  // 格式化输出
  const bjYear = beijingTime.getUTCFullYear();
  const bjMonth = String(beijingTime.getUTCMonth() + 1).padStart(2, "0");
  const bjDay = String(beijingTime.getUTCDate()).padStart(2, "0");
  const bjHour = String(beijingTime.getUTCHours()).padStart(2, "0");
  const bjMinute = String(beijingTime.getUTCMinutes()).padStart(2, "0");
  const bjSecond = String(beijingTime.getUTCSeconds()).padStart(2, "0");

  return `${bjYear}-${bjMonth}-${bjDay} ${bjHour}:${bjMinute}:${bjSecond} `;
}
