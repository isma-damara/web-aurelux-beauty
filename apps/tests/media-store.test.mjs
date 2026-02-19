import assert from "node:assert/strict";
import test from "node:test";
import { isManagedUploadUrl } from "../lib/media-store.js";

test("isManagedUploadUrl menerima local upload path", () => {
  assert.equal(isManagedUploadUrl("/uploads/images/example.jpg"), true);
  assert.equal(isManagedUploadUrl("/uploads/videos/example.mp4"), true);
});

test("isManagedUploadUrl menerima URL Blob yang dikonfigurasi", () => {
  const previousBase = process.env.BLOB_PUBLIC_BASE_URL;
  process.env.BLOB_PUBLIC_BASE_URL = "https://demo.public.blob.vercel-storage.com";

  try {
    assert.equal(isManagedUploadUrl("https://demo.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"), true);
    assert.equal(
      isManagedUploadUrl("https://other.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"),
      false
    );
  } finally {
    process.env.BLOB_PUBLIC_BASE_URL = previousBase;
  }
});

test("isManagedUploadUrl menerima URL Blob saat base URL tanpa protocol atau berupa full URL file", () => {
  const previousBase = process.env.BLOB_PUBLIC_BASE_URL;

  try {
    process.env.BLOB_PUBLIC_BASE_URL = "demo.public.blob.vercel-storage.com";
    assert.equal(isManagedUploadUrl("https://demo.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"), true);

    process.env.BLOB_PUBLIC_BASE_URL =
      "https://demo.public.blob.vercel-storage.com/aurelux-beauty/images/some-file.jpg";
    assert.equal(isManagedUploadUrl("https://demo.public.blob.vercel-storage.com/aurelux-beauty/images/other.jpg"), true);
  } finally {
    process.env.BLOB_PUBLIC_BASE_URL = previousBase;
  }
});

test("isManagedUploadUrl menerima URL Blob public host saat base URL belum diisi", () => {
  const previousBase = process.env.BLOB_PUBLIC_BASE_URL;
  process.env.BLOB_PUBLIC_BASE_URL = "";

  try {
    assert.equal(
      isManagedUploadUrl("https://fallback.public.blob.vercel-storage.com/aurelux-beauty/images/sample.jpg"),
      true
    );
  } finally {
    process.env.BLOB_PUBLIC_BASE_URL = previousBase;
  }
});

test("isManagedUploadUrl menolak URL eksternal", () => {
  assert.equal(isManagedUploadUrl("https://cdn.example.com/media/images/sample.jpg"), false);
  assert.equal(isManagedUploadUrl("https://example.com/random.jpg"), false);
});
