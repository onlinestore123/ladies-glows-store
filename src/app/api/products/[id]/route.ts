import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "تعذر جلب المنتج" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const id = Number(params.id);
    const body = await request.json();
    const name = body.name ?? body.nameAr;
    const description = body.description ?? body.descriptionAr;

    const [updated] = await db
      .update(products)
      .set({
        name,
        nameAr: name,
        description,
        descriptionAr: description,
        price: Number(body.price) || 0,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        category: body.category,
        images: Array.isArray(body.images) ? body.images : [],
        video: body.video || null,
        ingredients: body.ingredients ?? null,
        ingredientsAr: body.ingredients ?? null,
        stock: Number(body.stock) || 0,
        featured: Boolean(body.featured),
        isNew: Boolean(body.isNew),
        isBestseller: Boolean(body.isBestseller),
        // rating / reviewCount are intentionally never updated here.
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحديث المنتج" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const id = Number(params.id);
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف المنتج" }, { status: 500 });
  }
}
