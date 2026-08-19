import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  nameAr: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  // الخيار الذي اختارته الزبونة (رائحة/لون...) إن وجد
  variant?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // عنصر "اشترِ الآن" - مؤقت وغير محفوظ، يُستخدم فقط لتمرير منتج واحد مباشرة لصفحة الدفع
  // بدون التأثير على محتوى السلة العادية
  buyNowItem: CartItem | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, variant?: string) => void;
  updateQuantity: (productId: number, quantity: number, variant?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setBuyNow: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearBuyNow: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      buyNowItem: null,

      setBuyNow: (item, quantity = 1) => {
        set({ buyNowItem: { ...item, quantity: Math.min(quantity, item.stock) } });
      },

      clearBuyNow: () => set({ buyNowItem: null }),

      addItem: (item, quantity = 1) => {
        set((state) => {
          // نفس المنتج بنفس الخيار (الرائحة/اللون) يُعتبر سطراً واحداً في السلة،
          // لكن نفس المنتج بخيار مختلف يُعتبر سطراً منفصلاً
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variant === item.variant
          );
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, item.stock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variant === item.variant
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }],
          };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.variant === variant)),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variant === variant
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "ladies-glows-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
