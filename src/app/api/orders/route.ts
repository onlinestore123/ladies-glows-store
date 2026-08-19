import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { getPublicSettings } from "@/lib/settings";
import { getWilayaByCode } from "@/lib/wilayas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return NextResponse.json({ orders: all });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "تعذر جلب الطلبات" }, { status: 500 });
  }
}

const VALID_METHODS = ["desk", "home", "pickup"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      !body.customerName ||
      !body.customerPhone ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 });
    }

    const deliveryMethod: string = VALID_METHODS.includes(body.deliveryMethod)
      ? body.deliveryMethod
      : "home";

    const settings = await getPublicSettings();

    let wilayaCode: string | null = null;
    let wilayaName: string | null = null;
    let deliveryPrice = 0;

    if (deliveryMethod === "pickup") {
      if (!settings.pickupEnabled) {
        return NextResponse.json({ error: "خيار الاستلام من المتجر غير متاح حالياً" }, { status: 400 });
      }
      // لا حاجة للولاية أو العنوان في حالة الاستلام من عند البائع، ولا يوجد سعر توصيل
    } else {
      if (!body.wilayaCode || !body.customerAddress) {
        return NextResponse.json({ error: "يرجى اختيار الولاية وإدخال العنوان" }, { status: 400 });
      }
      const wilaya = getWilayaByCode(String(body.wilayaCode));
      if (!wilaya) {
        return NextResponse.json({ error: "الولاية غير صحيحة" }, { status: 400 });
      }
      wilayaCode = wilaya.code;
      wilayaName = wilaya.nameAr;
      // السعر يُحسب من الخادم دائماً (لا نثق بأي سعر يُرسل من المتصفح)
      const pricing = settings.wilayaPricing[wilaya.code];
      deliveryPrice = pricing ? pricing[deliveryMethod as "desk" | "home"] : 0;
    }

    const itemsTotal = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const total = itemsTotal + deliveryPrice;

    const [created] = await db
      .insert(orders)
      .values({
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: deliveryMethod === "pickup" ? null : body.customerAddress,
        customerCity: deliveryMethod === "pickup" ? "استلام من المتجر" : wilayaName ?? "",
        wilayaCode,
        wilayaName,
        deliveryMethod,
        deliveryPrice,
        notes: body.notes ?? null,
        items: body.items,
        total,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ order: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "تعذر إنشاء الطلب" }, { status: 500 });
  }
}
