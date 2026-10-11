export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  product_count?: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  discount: number | null;
  category_id: string | null;
  category?: Category | null;
  brand: string | null;
  stock: number;
  sku: string | null;
  rating: number | null;
  reviews_count?: number | null;
  image: string | null;
  images?: ProductImage[];
  specifications: Record<string, string> | null;
  colors?: string[];
  mechanism?: string | null;
  is_active: boolean;
  is_new?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Slider {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: "customer" | "moderator" | "content_admin" | "super_admin";
  avatar_url: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  address: string;
  note: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  items?: OrderItem[];
  created_at: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
}

export type PromoDiscountType = "percent" | "fixed";

export interface Promocode {
  id: string;
  code: string;
  discount_type: PromoDiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}
