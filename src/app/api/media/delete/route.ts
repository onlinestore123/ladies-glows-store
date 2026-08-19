import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { deleteFromCloudinary, parseCloudinaryUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const url: string | undefined = body.url;
    if (!url) {
      return NextResponse.json({ error: "الرابط مطلوب" }, { status: 400 });
    }

    const parsed = parseCloudinaryUrl(url);
    if (!parsed) {
      // ليس رابط Cloudinary (قد يكون صورة قديمة من نظام سابق) - لا داعي لفشل الطلب
      return NextResponse.json({ success: true, skipped: true });
    }

    await deleteFromCloudinary(parsed.publicId, parsed.resourceType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/media/delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حذف الملف" },
      { status: 500 }
    );
  }
}
