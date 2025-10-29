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
      return new Response(JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        message: "API is running" 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleUpload(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { id, image } = data;

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

    await env.PHOTO_BUCKET.put(fileName, buffer, {
      httpMetadata: {
        contentType: "image/png",
      },
    });

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

    const photos = await Promise.all(
      pagePhotos.map(async (obj) => {
        const object = await env.PHOTO_BUCKET.get(obj.key);
        const arrayBuffer = await object.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);

        const timeStr = obj.key.split("/")[1].replace(".png", "");
        const formattedTime = formatTime(timeStr);

        return {
          url: `data:image/png;base64,${base64}`,
          time: formattedTime,
          key: obj.key,
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    if (!id) {
      return new Response(JSON.stringify({ error: "ID参数缺失" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listed = await env.PHOTO_BUCKET.list({
      prefix: `${id}/`,
    });

    await Promise.all(
      listed.objects.map((obj) => env.PHOTO_BUCKET.delete(obj.key))
    );

    return new Response(
      JSON.stringify({ success: true, deleted: listed.objects.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("删除照片错误:", error);
    return new Response(JSON.stringify({ error: "删除失败" }), {
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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatTime(timeStr) {
  if (timeStr.length < 14) return timeStr;
  const year = "20" + timeStr.slice(0, 2);
  const month = timeStr.slice(2, 4);
  const day = timeStr.slice(4, 6);
  const hour = timeStr.slice(6, 8);
  const minute = timeStr.slice(8, 10);
  const second = timeStr.slice(10, 12);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
