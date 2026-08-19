import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminSettings } from "@/db/schema";

const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${derived}`;
}

function comparePassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derived = scryptSync(password, salt, KEY_LEN);
  const storedBuf = Buffer.from(derivedHex, "hex");
  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

/**
 * Verifies a password attempt against the admin_settings table.
 * If no row exists yet (first-ever use), falls back to comparing
 * against the bootstrap ADMIN_KEY environment variable.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const rows = await db.select().from(adminSettings).limit(1);
  const existing = rows[0];

  if (existing) {
    return comparePassword(password, existing.passwordHash);
  }

  // Bootstrap mode: no password has ever been set in the DB yet.
  const bootstrapKey = process.env.ADMIN_KEY;
  if (!bootstrapKey) return false;
  return password === bootstrapKey;
}

/**
 * Verifies the current password, then stores the new one (hashed).
 * Returns { ok: true } on success, or { ok: false, error } on failure.
 */
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" };
  }

  const isValid = await verifyAdminPassword(currentPassword);
  if (!isValid) {
    return { ok: false, error: "كلمة المرور الحالية غير صحيحة" };
  }

  const newHash = hashPassword(newPassword);
  const rows = await db.select().from(adminSettings).limit(1);
  const existing = rows[0];

  if (existing) {
    await db
      .update(adminSettings)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(adminSettings.id, existing.id));
  } else {
    await db.insert(adminSettings).values({ passwordHash: newHash });
  }

  return { ok: true };
}
