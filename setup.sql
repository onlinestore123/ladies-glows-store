-- شغّلي هذا الملف كاملاً مرة واحدة في Neon SQL Editor.
-- آمن للتشغيل أكثر من مرة: يستخدم IF NOT EXISTS في كل مكان،
-- فسواء كانت قاعدة بياناتك جديدة أو قديمة (من نسخة سابقة من هذا المشروع)، لن يحذف أي بيانات.

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  category TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  video TEXT,
  ingredients TEXT,
  ingredients_ar TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO categories (name, name_ar, slug, icon) VALUES
  ('Face Care', 'العناية بالوجه', 'face-care', '✨'),
  ('Body Care', 'العناية بالجسم', 'body-care', '🌿'),
  ('Hair Care', 'العناية بالشعر', 'hair-care', '💆'),
  ('Serums & Oils', 'السيروم والزيوت', 'serums-oils', '💧'),
  ('Masks', 'الأقنعة', 'masks', '🌸')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ترحيل (Migration) v2: التوصيل الجزائري + إعدادات البائع + Cloudinary
-- إذا كانت قاعدة بياناتك جديدة كلياً، هذه الأعمدة ستُنشأ مباشرة ضمن الجداول أعلاه غالباً،
-- لكن الأسطر التالية ضرورية إذا كانت قاعدة البيانات موجودة من قبل هذا التحديث.
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS wilaya_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wilaya_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'home';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_price REAL NOT NULL DEFAULT 0;
ALTER TABLE orders ALTER COLUMN customer_address DROP NOT NULL;

ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS pickup_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS wilaya_pricing JSONB;
