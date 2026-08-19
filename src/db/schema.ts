import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import type { WilayaPricing } from "@/lib/wilayas";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  category: text("category").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  video: text("video"),
  ingredients: text("ingredients"),
  ingredientsAr: text("ingredients_ar"),
  // خيارات المنتج (روائح/ألوان/أحجام...) - قائمة نصوص بسيطة، فارغة يعني منتج بدون خيارات
  variants: jsonb("variants").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export interface OrderItem {
  productId: number;
  productName: string;
  productNameAr: string;
  quantity: number;
  price: number;
  image: string;
  // الخيار الذي اختاره الزبون (رائحة/لون...) إن وجد
  variant?: string;
}

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  // العنوان قد يكون فارغاً في حالة "الاستلام من عند البائع" (لا يوجد توصيل)
  customerAddress: text("customer_address"),
  // نُبقي على هذا الحقل لتوافق الأنظمة القديمة، ويُملأ تلقائياً باسم الولاية المختارة
  customerCity: text("customer_city").notNull(),
  wilayaCode: text("wilaya_code"),
  wilayaName: text("wilaya_name"),
  // desk = توصيل للمكتب | home = توصيل للمنزل | pickup = استلام من عند البائع (بدون توصيل)
  deliveryMethod: text("delivery_method").notNull().default("home"),
  deliveryPrice: real("delivery_price").notNull().default(0),
  notes: text("notes"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  // معلومات تواصل يعرضها المتجر للزبائن (زر واتساب، روابط تواصل اجتماعي)
  whatsappNumber: text("whatsapp_number"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  // خيار "استلام من عند البائع" بدون أي رسوم توصيل
  pickupEnabled: boolean("pickup_enabled").notNull().default(false),
  pickupAddress: text("pickup_address"),
  // أسعار التوصيل لكل ولاية (مكتب/منزل) - راجع src/lib/wilayas.ts للقيم الافتراضية
  wilayaPricing: jsonb("wilaya_pricing").$type<WilayaPricing>(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AdminSettingsRow = typeof adminSettings.$inferSelect;
