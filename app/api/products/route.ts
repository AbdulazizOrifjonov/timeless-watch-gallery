import { NextResponse } from "next/server";
import {
  getServerCustomProducts,
  addServerCustomProduct,
  deleteServerCustomProduct,
} from "@/lib/server-products";
import { Product } from "@/types/database";

export async function GET() {
  try {
    const products = getServerCustomProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to get products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: Product = await req.json();
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }

    const saved = addServerCustomProduct(body);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    deleteServerCustomProduct(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
