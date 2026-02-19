import assert from "node:assert/strict";
import test from "node:test";
import { isManagedUploadUrl } from "../lib/media-store.js";

test("isManagedUploadUrl menerima local upload path", () => {
  assert.equal(isManagedUploadUrl("/uploads/images/example.jpg"), true);
  assert.equal(isManagedUploadUrl("/uploads/videos/example.mp4"), true);
});

test("isManagedUploadUrl menerima URL Cloudinary untuk cloud yang sama", () => {
  const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";

  try {
    assert.equal(
      isManagedUploadUrl("https://res.cloudinary.com/demo-cloud/image/upload/v1/aurelux-beauty/images/sample.jpg"),
      true
    );
    assert.equal(
      isManagedUploadUrl("https://res.cloudinary.com/other-cloud/image/upload/v1/aurelux-beauty/images/sample.jpg"),
      false
    );
  } finally {
    process.env.CLOUDINARY_CLOUD_NAME = previousCloudName;
  }
});

test("isManagedUploadUrl menolak URL eksternal arbitrary", () => {
  assert.equal(isManagedUploadUrl("https://example.com/random.jpg"), false);
});
