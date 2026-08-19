import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminSettings } from "@/db/schema";
import { getDefaultWilayaPricing, type WilayaPricing } from "@/lib/wilayas";

export interface PublicSettings {
  whatsappNumber: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  pickupEnabled: boolean;
  pickupAddress: string | null;
  wilayaPricing: WilayaPricing;
}

async function getRow() {
  const rows = await db.select().from(adminSettings).limit(1);
  return rows[0] ?? null;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const row = await getRow();
  return {
    whatsappNumber: row?.whatsappNumber ?? null,
    instagramUrl: row?.instagramUrl ?? null,
    facebookUrl: row?.facebookUrl ?? null,
    pickupEnabled: row?.pickupEnabled ?? false,
    pickupAddress: row?.pickupAddress ?? null,
    wilayaPricing: (row?.wilayaPricing as WilayaPricing | null) ?? getDefaultWilayaPricing(),
  };
}

export async function updateSettings(patch: Partial<PublicSettings>): Promise<void> {
  const row = await getRow();

  if (!row) {
    // لا يمكن إنشاء صف إعدادات بدون كلمة مرور (passwordHash إلزامي).
    // في التطبيق العملي، صف admin_settings يُنشأ دائماً أول مرة عبر تسجيل الدخول/تغيير كلمة المرور.
    throw new Error("لم يتم إعداد الحساب الإداري بعد. سجّلي الدخول أولاً من لوحة التحكم.");
  }

  await db
    .update(adminSettings)
    .set({
      ...(patch.whatsappNumber !== undefined ? { whatsappNumber: patch.whatsappNumber } : {}),
      ...(patch.instagramUrl !== undefined ? { instagramUrl: patch.instagramUrl } : {}),
      ...(patch.facebookUrl !== undefined ? { facebookUrl: patch.facebookUrl } : {}),
      ...(patch.pickupEnabled !== undefined ? { pickupEnabled: patch.pickupEnabled } : {}),
      ...(patch.pickupAddress !== undefined ? { pickupAddress: patch.pickupAddress } : {}),
      ...(patch.wilayaPricing !== undefined ? { wilayaPricing: patch.wilayaPricing } : {}),
      updatedAt: new Date(),
    })
    .where(eq(adminSettings.id, row.id));
}
