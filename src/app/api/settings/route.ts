import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { getPublicSettings, updateSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// مسموح للجميع (بدون كلمة مرور) - المتجر نفسه يحتاجها لعرض زر واتساب وأسعار التوصيل عند الدفع
export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "تعذر جلب الإعدادات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    await updateSettings({
      whatsappNumber: body.whatsappNumber ?? null,
      instagramUrl: body.instagramUrl ?? null,
      facebookUrl: body.facebookUrl ?? null,
      pickupEnabled: Boolean(body.pickupEnabled),
      pickupAddress: body.pickupAddress ?? null,
      wilayaPricing: body.wilayaPricing ?? undefined,
    });

    const settings = await getPublicSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تحديث الإعدادات" },
      { status: 500 }
    );
  }
}
