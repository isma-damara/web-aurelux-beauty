import { NextResponse } from "next/server";
import { appendActivityLog, createProduct, listProducts } from "../../../../lib/content-repository";
import { requireAdminSession } from "../../../../lib/admin-route-auth";
import { resolveAdminActor } from "../../../../lib/admin-auth";
import { buildChangeDiff } from "../../../../lib/diff-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal membaca produk." }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const payload = await request.json();
    const actor = resolveAdminActor(request, session);
    const beforeProducts = await listProducts();
    const products = await createProduct(payload, { actor });
    const beforeIds = new Set(beforeProducts.map((item) => item.id));
    const createdProduct = products.find((item) => !beforeIds.has(item.id)) || null;

    await appendActivityLog({
      actor,
      action: "product.create",
      target: { collection: "products", id: createdProduct?.id || payload?.id || null },
      changes: buildChangeDiff(null, createdProduct),
      metadata: { beforeCount: beforeProducts.length, afterCount: products.length }
    });

    return NextResponse.json(products, { status: 201 });
  } catch (error) {
    const status = error.message?.includes("wajib diisi") ? 400 : 500;
    return NextResponse.json({ message: error.message || "Gagal membuat produk." }, { status });
  }
}
