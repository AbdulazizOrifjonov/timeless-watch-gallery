"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Category, Order, OrderStatus, Product, Promocode, Slider } from "@/types/database";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SLIDERS,
  DEFAULT_PROMOCODES,
} from "@/lib/default-data";

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface StoreValue {
  products: Product[];
  categories: Category[];
  sliders: Slider[];
  orders: Order[];
  promocodes: Promocode[];
  ready: boolean;

  addProduct: (p: Partial<Product>) => Product;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (c: Partial<Category>) => Category;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addSlider: (s: Partial<Slider>) => Slider;
  updateSlider: (id: string, s: Partial<Slider>) => void;
  deleteSlider: (id: string) => void;
  reorderSlider: (id: string, direction: "up" | "down") => void;

  createOrder: (o: Omit<Order, "id" | "order_number" | "status" | "created_at"> & { id?: string; order_number?: string }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  addPromocode: (p: Partial<Promocode>) => Promocode;
  updatePromocode: (id: string, p: Partial<Promocode>) => void;
  deletePromocode: (id: string) => void;
  togglePromocode: (id: string) => void;
  applyPromocode: (code: string, subtotal: number) => { ok: boolean; promocode?: Promocode; discount: number; error?: string };
  
  profileSidebarOpen: boolean;
  setProfileSidebarOpen: (v: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [sliders, setSliders] = useState<Slider[]>(DEFAULT_SLIDERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promocodes, setPromocodes] = useState<Promocode[]>(DEFAULT_PROMOCODES);
  const [ready, setReady] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: p },
          { data: c },
          { data: s },
          { data: o }
        ] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("categories").select("*"),
          supabase.from("sliders").select("*").order("sort_order", { ascending: true }),
          supabase.from("orders").select("*").order("created_at", { ascending: false })
        ]);

        // Supabase bazasida qolib ketgan eski axlatlarni (DeWalt, Bosch, Makita, Crown, Resanta, Edon, Hilda) olib tashlaymiz
        const dummyBrands = ["DeWalt", "Bosch", "Makita", "Crown", "Resanta", "Edon", "Hilda"];
        
        const validSupabaseProducts = p ? p.filter((prod: Product) => !dummyBrands.includes(prod.brand || "")) : [];
        const mergedProducts = [...DEFAULT_PRODUCTS];
        for (const sp of validSupabaseProducts) {
          const idx = mergedProducts.findIndex((x) => x.id === sp.id);
          if (idx >= 0) mergedProducts[idx] = sp; // update with DB version
          else mergedProducts.unshift(sp); // new product from admin panel
        }
        setProducts(mergedProducts);

        const validSupabaseCategories = c ? c.filter((cat: Category) => cat.id !== "dummy-id") : [];
        const mergedCategories = [...DEFAULT_CATEGORIES];
        for (const sc of validSupabaseCategories) {
          const idx = mergedCategories.findIndex((x) => x.id === sc.id);
          if (idx >= 0) mergedCategories[idx] = sc;
          else mergedCategories.unshift(sc);
        }
        setCategories(mergedCategories);

        if (s && s.length > 0) {
          const promoConfig = s.find((item) => item.id === "system_promocodes");
          if (promoConfig && promoConfig.subtitle) {
            try {
              const parsed = JSON.parse(promoConfig.subtitle);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPromocodes(parsed);
                try { localStorage.setItem("gws_promocodes", JSON.stringify(parsed)); } catch {}
              } else {
                setPromocodes(DEFAULT_PROMOCODES);
              }
            } catch (err) {
              console.error("Error parsing promocodes:", err);
              setPromocodes(DEFAULT_PROMOCODES);
            }
          } else {
            let loaded = false;
            try {
              const local = typeof window !== "undefined" ? localStorage.getItem("gws_promocodes") : null;
              if (local) {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setPromocodes(parsed);
                  loaded = true;
                }
              }
            } catch {}
            if (!loaded) {
              setPromocodes(DEFAULT_PROMOCODES);
            }
          }
          const validSliders = s.filter((item) => !item.id.startsWith("system_"));
          if (validSliders.length > 0) setSliders(validSliders);
        }
        if (o) {
          setOrders(
            o.map((row: any) => ({
              id: row.id,
              order_number: row.order_number || `ORD-${String(row.id).slice(0, 6)}`,
              user_id: row.user_id || (Array.isArray(row.items) && row.items[0]?.user_id) || null,
              full_name: row.customer_name || row.full_name || "Mijoz",
              phone: row.phone || "",
              address: row.address || "",
              note: row.note || (Array.isArray(row.items) && row.items[0]?.note) || null,
              subtotal: Number(row.total_amount || row.total || 0),
              delivery_fee: Number(row.delivery_fee || 0),
              discount: Number(row.discount || 0),
              total: Number(row.total_amount || row.total || 0),
              status: (row.status as OrderStatus) || "new",
              items: (Array.isArray(row.items) ? row.items : []).map((it: any) => ({
                id: it.id || it.product_id || "",
                order_id: row.id,
                product_id: it.product_id || it.id || "",
                product_name: it.product_name || it.name || "Mahsulot",
                product_image: it.product_image || it.image || null,
                price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
              })),
              created_at: row.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    }
    loadData();

    // Realtime subscription for products & orders
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => {
              if (prev.find((p) => p.id === payload.new.id)) return prev;
              return [payload.new as Product, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) => prev.map((item) => item.id === payload.new.id ? (payload.new as Product) : item));
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row: any = payload.new;
            const mappedOrder: Order = {
              id: row.id,
              order_number: row.order_number || `ORD-${String(row.id).slice(0, 6)}`,
              user_id: row.user_id || (Array.isArray(row.items) && row.items[0]?.user_id) || null,
              full_name: row.customer_name || row.full_name || "Mijoz",
              phone: row.phone || "",
              address: row.address || "",
              note: row.note || (Array.isArray(row.items) && row.items[0]?.note) || null,
              subtotal: Number(row.total_amount || row.total || 0),
              delivery_fee: Number(row.delivery_fee || 0),
              discount: Number(row.discount || 0),
              total: Number(row.total_amount || row.total || 0),
              status: (row.status as OrderStatus) || "new",
              items: (Array.isArray(row.items) ? row.items : []).map((it: any) => ({
                id: it.id || it.product_id || "",
                order_id: row.id,
                product_id: it.product_id || it.id || "",
                product_name: it.product_name || it.name || "Mahsulot",
                product_image: it.product_image || it.image || null,
                price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
              })),
              created_at: row.created_at || new Date().toISOString(),
            };
            setOrders((prev) => {
              if (prev.find((ord) => ord.id === mappedOrder.id)) return prev;
              return [mappedOrder, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const row: any = payload.new;
            setOrders((prev) =>
              prev.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      status: (row.status as OrderStatus) || item.status,
                      full_name: row.customer_name || row.full_name || item.full_name,
                      phone: row.phone || item.phone,
                      address: row.address || item.address,
                      total: Number(row.total_amount || row.total || item.total),
                    }
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = useCallback((p: Partial<Product>) => {
    const now = new Date().toISOString();
    
    // UUID v4 generator fallback agar crypto ishlamasa
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const newId = generateUUID();

    const newProduct: Product = {
      id: newId,
      name: p.name ?? "Nomsiz",
      slug: (p.name ?? "nomsiz").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
      description: p.description ?? "",
      price: p.price ?? 0,
      old_price: p.old_price ?? null,
      discount: p.discount ?? null,
      category_id: p.category_id ?? null,
      brand: p.brand ?? "",
      stock: p.stock ?? 0,
      sku: p.sku ?? "",
      rating: p.rating ?? 0,
      reviews_count: 0,
      image: p.image ?? null,
      images: p.images ?? [],
      specifications: p.specifications ?? {},
      colors: [],
      mechanism: p.mechanism ?? "Elektr tarmog'i",
      is_active: p.is_active ?? true,
      is_new: p.is_new ?? true,
      created_at: now,
      updated_at: now,
    };
    // Optimistic
    setProducts((prev) => [newProduct, ...prev]);
    
    // Supabase faqat bazada bor ustunlarni qabul qiladi.
    const dbPayload = {
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: newProduct.price,
      old_price: newProduct.old_price,
      discount: newProduct.discount,
      category_id: newProduct.category_id,
      brand: newProduct.brand,
      stock: newProduct.stock,
      sku: newProduct.sku,
      rating: newProduct.rating,
      reviews_count: newProduct.reviews_count,
      image: newProduct.image,
      images: newProduct.images,
      specifications: newProduct.specifications,
      is_active: newProduct.is_active,
      is_new: newProduct.is_new,
      created_at: newProduct.created_at
    };

    // Supabase
    supabase.from('products').insert(dbPayload).then(({ error }) => {
      if (error) {
        console.error("Error adding product:", error);
        alert("Saqlashda xatolik yuz berdi! Iltimos buni rasmga olib dasturchiga yuboring: " + JSON.stringify(error));
      }
    });
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...p } : item)));
    
    // Remove invalid columns for Supabase
    const { colors, mechanism, updated_at, ...validPayload } = p as any;
    
    supabase.from('products').update({ ...validPayload }).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating product:", error);
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    supabase.from('products').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting product:", error);
    });
  }, []);

  const addCategory = useCallback((c: Partial<Category>) => {
    const newCategory: Category = {
      id: crypto.randomUUID?.() || uid("c"),
      name: c.name ?? "Yangi kategoriya",
      slug: (c.name ?? "kategoriya").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: c.description ?? "",
      image_url: c.image_url ?? null,
      is_active: c.is_active ?? true,
      product_count: 0,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    supabase.from('categories').insert(newCategory).then(({ error }) => {
      if (error) console.error("Error adding category:", error);
    });
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, c: Partial<Category>) => {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
    supabase.from('categories').update(c).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating category:", error);
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((p) => p.id !== id));
    supabase.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting category:", error);
    });
  }, []);

  const addSlider = useCallback((s: Partial<Slider>) => {
    const newSlider: Slider = {
      id: crypto.randomUUID?.() || uid("s"),
      title: s.title ?? "Yangi Slayder",
      subtitle: s.subtitle ?? "",
      image_url: s.image_url ?? "",
      button_text: s.button_text ?? "",
      link: s.link ?? "/",
      sort_order: sliders.length + 1,
      is_active: s.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    setSliders((prev) => [...prev, newSlider]);
    supabase.from('sliders').insert(newSlider).then(({ error }) => {
      if (error) console.error("Error adding slider:", error);
    });
    return newSlider;
  }, [sliders.length]);

  const updateSlider = useCallback((id: string, s: Partial<Slider>) => {
    setSliders((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item)));
    supabase.from('sliders').update(s).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating slider:", error);
    });
  }, []);

  const deleteSlider = useCallback((id: string) => {
    setSliders((prev) => prev.filter((p) => p.id !== id));
    supabase.from('sliders').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting slider:", error);
    });
  }, []);

  const reorderSlider = useCallback((id: string, direction: "up" | "down") => {
    // simplified optimistic
  }, []);

  const createOrder = useCallback((o: Omit<Order, "id" | "order_number" | "status" | "created_at"> & { id?: string; order_number?: string }) => {
    const num = Math.floor(100000 + Math.random() * 900000);
    const orderId = o.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : uid("o"));
    const orderNumber = o.order_number || `ORD-${num}`;
    const newOrder: Order = {
      ...o,
      id: orderId,
      order_number: orderNumber,
      status: "new",
      created_at: new Date().toISOString(),
    };
    setOrders((prev) => {
      if (prev.find((ord) => ord.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });

    const formattedItems = (newOrder.items || []).map((it) => ({
      id: it.product_id || it.id || "",
      product_id: it.product_id || it.id || "",
      name: it.product_name || (it as any).name || "Mahsulot",
      product_name: it.product_name || (it as any).name || "Mahsulot",
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      image: it.product_image || (it as any).image || null,
      product_image: it.product_image || (it as any).image || null,
      user_id: newOrder.user_id || null,
      note: newOrder.note || null,
    }));

    const dbRow = {
      id: orderId,
      order_number: orderNumber,
      user_id: newOrder.user_id || null,
      customer_name: newOrder.full_name,
      phone: newOrder.phone,
      address: newOrder.address,
      note: newOrder.note || null,
      subtotal: newOrder.subtotal || newOrder.total || 0,
      delivery_fee: newOrder.delivery_fee || 0,
      discount: newOrder.discount || 0,
      total_amount: newOrder.total,
      status: "new",
      items: formattedItems,
      created_at: newOrder.created_at,
    };

    supabase.from('orders').upsert(dbRow).then(({ error }) => {
      if (error) console.error("Error adding order to Supabase:", error);
    });
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    supabase.from('orders').update({ status }).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating order status:", error);
    });
  }, []);

  const syncPromocodes = useCallback((list: Promocode[]) => {
    setPromocodes(list);
    try {
      localStorage.setItem("gws_promocodes", JSON.stringify(list));
    } catch {}
    supabase
      .from("sliders")
      .upsert({
        id: "system_promocodes",
        title: "CONFIG_PROMOCODES",
        subtitle: JSON.stringify(list),
        image_url: "https://example.com/config.png",
        button_text: null,
        link: null,
        sort_order: 9999,
        is_active: false,
      })
      .then(({ error }) => {
        if (error) console.error("Error syncing promocodes:", error);
      });
  }, []);

  const addPromocode = useCallback(
    (p: Partial<Promocode>) => {
      const newPromo: Promocode = {
        id: crypto.randomUUID?.() || uid("pr"),
        code: (p.code || "").toUpperCase().trim(),
        discount_type: p.discount_type || "percent",
        discount_value: Number(p.discount_value) || 0,
        min_order_amount: Number(p.min_order_amount) || 0,
        max_discount_amount: p.max_discount_amount ? Number(p.max_discount_amount) : null,
        usage_limit: p.usage_limit ? Number(p.usage_limit) : null,
        used_count: 0,
        expires_at: p.expires_at || null,
        is_active: p.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      const updated = [newPromo, ...promocodes];
      syncPromocodes(updated);
      return newPromo;
    },
    [promocodes, syncPromocodes]
  );

  const updatePromocode = useCallback(
    (id: string, p: Partial<Promocode>) => {
      const updated = promocodes.map((item) =>
        item.id === id ? { ...item, ...p } : item
      );
      syncPromocodes(updated);
    },
    [promocodes, syncPromocodes]
  );

  const deletePromocode = useCallback(
    (id: string) => {
      const updated = promocodes.filter((item) => item.id !== id);
      syncPromocodes(updated);
    },
    [promocodes, syncPromocodes]
  );

  const togglePromocode = useCallback(
    (id: string) => {
      const updated = promocodes.map((item) =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      );
      syncPromocodes(updated);
    },
    [promocodes, syncPromocodes]
  );

  const applyPromocode = useCallback(
    (codeStr: string, subtotal: number) => {
      const clean = codeStr.toUpperCase().trim();
      const found = promocodes.find((p) => p.code.toUpperCase() === clean);

      if (!found || !found.is_active) {
        return { ok: false, discount: 0, error: "Bunday promokod mavjud emas yoki faol emas." };
      }

      if (found.expires_at && new Date(found.expires_at).getTime() < Date.now()) {
        return { ok: false, discount: 0, error: "Ushbu promokodning amal qilish muddati tugagan." };
      }

      if (found.usage_limit && found.used_count >= found.usage_limit) {
        return { ok: false, discount: 0, error: "Ushbu promokoddan foydalanish soni cheklangan va tugagan." };
      }

      if (subtotal < found.min_order_amount) {
        return {
          ok: false,
          discount: 0,
          error: `Ushbu promokodni ishlatish uchun buyurtma summasi kamida ${found.min_order_amount.toLocaleString("en-US").replace(/,/g, " ")} so'm bo'lishi kerak. Sizda: ${subtotal.toLocaleString("en-US").replace(/,/g, " ")} so'm.`,
        };
      }

      let discount = 0;
      if (found.discount_type === "percent") {
        discount = Math.round((subtotal * found.discount_value) / 100);
        if (found.max_discount_amount && found.max_discount_amount > 0) {
          discount = Math.min(discount, found.max_discount_amount);
        }
      } else {
        discount = Math.min(found.discount_value, subtotal);
      }

      return { ok: true, promocode: found, discount };
    },
    [promocodes]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        sliders,
        orders,
        promocodes,
        ready,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSlider,
        updateSlider,
        deleteSlider,
        reorderSlider,
        createOrder,
        updateOrderStatus,
        addPromocode,
        updatePromocode,
        deletePromocode,
        togglePromocode,
        applyPromocode,
        profileSidebarOpen,
        setProfileSidebarOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}

export async function fileToDataUrl(file: File, maxSize: number = 800, quality: number = 0.85): Promise<string> {
  // If we wanted to upload directly to supabase here, we could.
  // But for base64 fallback:
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}



