import { createHash } from "crypto";

/**
 * حذف ملف (صورة أو فيديو) من Cloudinary باستخدام طلب موقّع (signed request).
 * هذا يعمل من طرف الخادم فقط، لأنه يحتاج CLOUDINARY_API_SECRET السري
 * الذي لا يجب أبداً أن يظهر في كود المتصفح (لهذا لوحة التحكم لا تستطيع الحذف مباشرة،
 * بل تطلب من هذا المشروع "المتجر" أن يحذف نيابة عنها عبر /api/media/delete).
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("لم يتم ضبط متغيرات Cloudinary في المتجر (CLOUDINARY_*)");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // التوقيع يجب أن يشمل نفس البارامترات المرسلة (بالترتيب الأبجدي)، بدون api_key/api_secret/file
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  const form = new URLSearchParams();
  form.set("public_id", publicId);
  form.set("timestamp", String(timestamp));
  form.set("api_key", apiKey);
  form.set("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    { method: "POST", body: form }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.result && data.result !== "ok" && data.result !== "not found")) {
    throw new Error(data.error?.message ?? "تعذر حذف الملف من Cloudinary");
  }
}

/**
 * يستخرج public_id (ومعه resource_type) من رابط Cloudinary كامل، مثال:
 * https://res.cloudinary.com/demo/image/upload/v1690000000/ladies-glows/abc123.jpg
 * -> { publicId: "ladies-glows/abc123", resourceType: "image" }
 * نعتمد على هذا بدل تخزين public_id في قاعدة البيانات، حتى لا نغيّر بنية جدول المنتجات.
 */
export function parseCloudinaryUrl(
  url: string
): { publicId: string; resourceType: "image" | "video" } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("cloudinary.com")) return null;

    const parts = u.pathname.split("/").filter(Boolean);
    // parts مثال: ["<cloud_name>", "image", "upload", "v1690000000", "ladies-glows", "abc123.jpg"]
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex < 1) return null;

    const resourceType = parts[uploadIndex - 1] === "video" ? "video" : "image";

    let rest = parts.slice(uploadIndex + 1);
    // تجاهل جزء النسخة (v123456789) إن وجد
    if (rest[0] && /^v\d+$/.test(rest[0])) {
      rest = rest.slice(1);
    }
    if (rest.length === 0) return null;

    const last = rest[rest.length - 1];
    const withoutExt = last.replace(/\.[a-zA-Z0-9]+$/, "");
    const publicId = [...rest.slice(0, -1), withoutExt].join("/");

    return { publicId, resourceType };
  } catch {
    return null;
  }
}
