import fs from "fs";
import path from "path";
import { Product } from "@/types/database";
import { supabase } from "@/lib/supabase";

function getProductsFilePath(): string {
  const localDataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDataDir)) {
    try {
      fs.mkdirSync(localDataDir, { recursive: true });
    } catch {
      return path.join("/tmp", "products.json");
    }
  }
  return path.join(localDataDir, "products.json");
}

declare global {
  // eslint-disable-next-line no-var
  var __globalServerProducts: Product[] | undefined;
}

export function getServerCustomProducts(): Product[] {
  if (globalThis.__globalServerProducts && globalThis.__globalServerProducts.length > 0) {
    return globalThis.__globalServerProducts;
  }

  const filePath = getProductsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__globalServerProducts = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading custom products file:", err);
  }

  globalThis.__globalServerProducts = [];
  return [];
}

export function saveServerCustomProducts(products: Product[]): void {
  globalThis.__globalServerProducts = products;
  try {
    const filePath = getProductsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving custom products file:", err);
  }
}

export function addServerCustomProduct(product: Product): Product {
  const current = getServerCustomProducts();
  const index = current.findIndex((p) => p.id === product.id);
  let updated: Product[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...product };
  } else {
    updated = [product, ...current];
  }

  saveServerCustomProducts(updated);
  return product;
}

export function deleteServerCustomProduct(id: string): boolean {
  const current = getServerCustomProducts();
  const filtered = current.filter((p) => p.id !== id);
  saveServerCustomProducts(filtered);
  return true;
}
