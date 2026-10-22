import fs from "fs";
import path from "path";
import { Order, OrderStatus } from "@/types/database";
import { supabase } from "@/lib/supabase";

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_859142",
    order_number: "ORD-859142",
    user_id: null,
    full_name: "Abdulazizbek Orifjonov",
    phone: "+998935821774",
    address: "Geolokatsiya orqali belgilandi",
    note: "tez kelsin",
    subtotal: 30560000,
    delivery_fee: 0,
    discount: 0,
    total: 30560000,
    status: "new",
    items: [
      {
        id: "p-orient-bambino-sun-moon",
        order_id: "ord_859142",
        product_id: "p-orient-bambino-sun-moon",
        product_name: "Orient Bambino Sun & Moon Automatic",
        product_image: "/products/orient_bambino_sun_moon.png",
        price: 3950000,
        quantity: 3,
      },
      {
        id: "p-tissot-prx-ice-blue",
        order_id: "ord_859142",
        product_id: "p-tissot-prx-ice-blue",
        product_name: "Tissot PRX Powermatic 80 Ice Blue",
        product_image: "/products/tissot_prx_powermatic_80_ice_blue.png",
        price: 9350000,
        quantity: 2,
      },
      {
        id: "p-casio-edifice-solar",
        order_id: "ord_859142",
        product_id: "p-casio-edifice-solar",
        product_name: "Casio Edifice Solar Sapphire",
        product_image: "/products/casio_edifice_solar_sapphire.png",
        price: 2500000,
        quantity: 4,
      },
    ],
    created_at: new Date().toISOString(),
  },
];

// Persistent file path
function getStorageFilePath(): string {
  const localDataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDataDir)) {
    try {
      fs.mkdirSync(localDataDir, { recursive: true });
    } catch {
      // Fallback to /tmp on readonly filesystems (like AWS Lambda / Vercel serverless)
      return path.join("/tmp", "orders.json");
    }
  }
  return path.join(localDataDir, "orders.json");
}

// Global server in-memory cache across serverless requests
declare global {
  // eslint-disable-next-line no-var
  var __globalServerOrders: Order[] | undefined;
}

export function getServerOrders(): Order[] {
  if (globalThis.__globalServerOrders && globalThis.__globalServerOrders.length > 0) {
    return globalThis.__globalServerOrders;
  }

  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__globalServerOrders = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading orders file:", err);
  }

  // Initialize with initial orders
  globalThis.__globalServerOrders = INITIAL_ORDERS;
  saveServerOrders(INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function saveServerOrders(orders: Order[]): void {
  globalThis.__globalServerOrders = orders;
  try {
    const filePath = getStorageFilePath();
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing orders file:", err);
  }
}

export function addServerOrder(newOrder: Order): Order {
  const existing = getServerOrders();
  const index = existing.findIndex((o) => o.id === newOrder.id || o.order_number === newOrder.order_number);
  let updated: Order[];

  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...updated[index], ...newOrder };
  } else {
    updated = [newOrder, ...existing];
  }

  saveServerOrders(updated);
  return newOrder;
}

export function updateServerOrderStatus(id: string, status: OrderStatus): boolean {
  const existing = getServerOrders();
  const index = existing.findIndex((o) => o.id === id);
  if (index >= 0) {
    const updated = [...existing];
    updated[index] = { ...updated[index], status };
    saveServerOrders(updated);
    return true;
  }
  return false;
}
