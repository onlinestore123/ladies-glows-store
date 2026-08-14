import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/adminAuth";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      !body.customerName ||
      !body.customerPhone ||
      !body.customerAddress ||
      !body.customerCity ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 });
    }

    const total = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const [created] = await db
      .insert(orders)
      .values({
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: body.customerAddress,
        customerCity: body.customerCity,
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
