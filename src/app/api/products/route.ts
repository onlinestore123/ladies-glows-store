import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await db.select().from(products).orderBy(desc(products.createdAt));
    return NextResponse.json({ products: all });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "تعذر جلب المنتجات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();

    const name = body.name ?? body.nameAr;
    const description = body.description ?? body.descriptionAr;

    if (!name || !description || !body.category) {
      return NextResponse.json({ error: "بيانات المنتج غير مكتملة" }, { status: 400 });
    }

    const [created] = await db
      .insert(products)
      .values({
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
        // rating and reviewCount are never accepted from the client —
        // they always start at 0 and are only ever changed by a real reviews system.
        rating: 0,
        reviewCount: 0,
      })
      .returning();

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "تعذر إضافة المنتج" }, { status: 500 });
  }
}
