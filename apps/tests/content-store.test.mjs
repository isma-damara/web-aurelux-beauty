import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProduct } from "../lib/content-store.js";

test("normalizeProduct membatasi detailImages maksimal 5 dan menghilangkan duplikat", () => {
  const product = normalizeProduct({
    id: "PROD100",
    name: "Produk Test",
    cardImage: "/uploads/images/card.jpg",
    detailImage: "/uploads/images/detail-legacy.jpg",
    detailImages: [
      "/uploads/images/detail-1.jpg",
      "/uploads/images/detail-2.jpg",
      "/uploads/images/detail-1.jpg",
      "/uploads/images/detail-3.jpg",
      "/uploads/images/detail-4.jpg",
      "/uploads/images/detail-5.jpg",
      "/uploads/images/detail-6.jpg"
    ]
  });

  assert.equal(product.detailImages.length, 5);
  assert.deepEqual(product.detailImages, [
    "/uploads/images/detail-1.jpg",
    "/uploads/images/detail-2.jpg",
    "/uploads/images/detail-3.jpg",
    "/uploads/images/detail-4.jpg",
    "/uploads/images/detail-5.jpg"
  ]);
  assert.equal(product.detailImage, "/uploads/images/detail-1.jpg");
});

test("normalizeProduct fallback ke cardImage saat detailImage tidak ada", () => {
  const product = normalizeProduct({
    id: "PROD101",
    name: "Produk Test",
    cardImage: "/uploads/images/card.jpg",
    detailImages: []
  });

  assert.deepEqual(product.detailImages, ["/uploads/images/card.jpg"]);
  assert.equal(product.detailImage, "/uploads/images/card.jpg");
});
