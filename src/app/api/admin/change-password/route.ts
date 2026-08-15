import { NextRequest, NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";

    const result = await changeAdminPassword(currentPassword, newPassword);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/change-password error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تغيير كلمة المرور" }, { status: 500 });
  }
}
