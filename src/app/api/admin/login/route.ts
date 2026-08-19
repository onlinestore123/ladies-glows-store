import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body.password ?? "";

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
