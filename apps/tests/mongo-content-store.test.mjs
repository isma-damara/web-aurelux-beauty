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

test("isAllowedMediaUrl menerima URL Cloudinary pada cloud yang sama", () => {
  const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";

  try {
    assert.equal(
      isAllowedMediaUrl("https://res.cloudinary.com/demo-cloud/image/upload/v1/aurelux-beauty/images/sample.jpg"),
      true
    );
  } finally {
    process.env.CLOUDINARY_CLOUD_NAME = previousCloudName;
  }
});

test("isAllowedMediaUrl menolak URL arbitrary non-managed", () => {
  assert.equal(isAllowedMediaUrl("https://example.com/manual-link.jpg"), false);
  assert.equal(isAllowedMediaUrl("https://cdn.some-random.com/video.mp4"), false);
});
