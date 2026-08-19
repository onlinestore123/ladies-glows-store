import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/adminAuth";
import type { OrderItem } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password") ?? "";
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);

    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const productCount = allProducts.length;

    // Top 5 best-selling products by total quantity sold across all orders
    const salesByProduct = new Map<number, { name: string; quantity: number }>();
    for (const order of allOrders) {
      if (order.status === "cancelled") continue;
      const items = order.items as OrderItem[];
      for (const item of items) {
        const existing = salesByProduct.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          salesByProduct.set(item.productId, {
            name: item.productNameAr,
            quantity: item.quantity,
          });
        }
      }
    }
    const topProducts = Array.from(salesByProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Revenue for the last 6 months
    const now = new Date();
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("ar-u-nu-latn", { month: "short", year: "numeric" });
      const monthRevenue = allOrders
        .filter((o) => {
          if (o.status === "cancelled") return false;
          const createdAt = new Date(o.createdAt);
          return (
            createdAt.getFullYear() === d.getFullYear() &&
            createdAt.getMonth() === d.getMonth()
          );
        })
        .reduce((sum, o) => sum + o.total, 0);
      months.push({ label, revenue: monthRevenue });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      productCount,
      topProducts,
      monthlyRevenue: months,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "تعذر جلب الإحصائيات" }, { status: 500 });
  }
}
