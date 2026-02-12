import { NextResponse } from "next/server";
import { appendActivityLog, deleteProduct, listProducts, updateProduct } from "../../../../../lib/content-repository";
import { requireAdminSession } from "../../../../../lib/admin-route-auth";
import { resolveAdminActor } from "../../../../../lib/admin-auth";
import { buildChangeDiff } from "../../../../../lib/diff-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const { productId } = params;
    const payload = await request.json();
    const actor = resolveAdminActor(request, session);
    const beforeProduct = (await listProducts()).find((item) => item.id === productId) || null;
    const updated = await updateProduct(productId, payload, { actor });

    if (!updated) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    await appendActivityLog({
      actor,
      action: "product.update",
      target: { collection: "products", id: productId },
      changes: buildChangeDiff(beforeProduct, updated)
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal memperbarui produk." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const { productId } = params;
    const actor = resolveAdminActor(request, session);
    const beforeProducts = await listProducts();
    const beforeProduct = beforeProducts.find((item) => item.id === productId) || null;
    const nextProducts = await deleteProduct(productId, { actor });

    if (!nextProducts) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    await appendActivityLog({
      actor,
      action: "product.delete",
      target: { collection: "products", id: productId },
      changes: buildChangeDiff(beforeProduct, null),
      metadata: { beforeCount: beforeProducts.length, afterCount: nextProducts.length }
    });

    return NextResponse.json(nextProducts);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal menghapus produk." }, { status: 500 });
  }
}
