import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedMediaUrl } from "../lib/mongo-content-store.js";

test("isAllowedMediaUrl menerima path aset internal legacy", () => {
  assert.equal(isAllowedMediaUrl("/assets/media/hero.mp4"), true);
  assert.equal(isAllowedMediaUrl("/product/product1.jpeg"), true);
  assert.equal(isAllowedMediaUrl("/logo/Bpom.png"), true);
});

test("isAllowedMediaUrl menerima managed local upload path", () => {
  assert.equal(isAllowedMediaUrl("/uploads/images/example.jpg"), true);
  assert.equal(isAllowedMediaUrl("/uploads/videos/example.mp4"), true);
});

test("isAllowedMediaUrl menerima URL Blob yang dikonfigurasi", () => {
  const previousBase = process.env.BLOB_PUBLIC_BASE_URL;
  process.env.BLOB_PUBLIC_BASE_URL = "https://demo.public.blob.vercel-storage.com";

  try {
    assert.equal(
      isAllowedMediaUrl("https://demo.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"),
      true
    );
    assert.equal(
      isAllowedMediaUrl("https://other.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"),
      false
    );
  } finally {
    process.env.BLOB_PUBLIC_BASE_URL = previousBase;
  }
});

test("isAllowedMediaUrl menolak URL arbitrary non-managed", () => {
  assert.equal(isAllowedMediaUrl("https://example.com/manual-link.jpg"), false);
  assert.equal(isAllowedMediaUrl("https://cdn.example.com/media/images/sample.jpg"), false);
  assert.equal(isAllowedMediaUrl("https://cdn.some-random.com/video.mp4"), false);
});
