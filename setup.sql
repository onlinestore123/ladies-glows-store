-- شغّلي هذا الملف كاملاً مرة واحدة في Neon SQL Editor بعد إنشاء قاعدة البيانات.
-- ينشئ الجداول فارغة، بدون أي منتجات وهمية.

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
  customer_address TEXT NOT NULL,
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
