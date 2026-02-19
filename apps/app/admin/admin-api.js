export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && typeof window !== "undefined") {
    const nextPath = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.href = `/admin/login?next=${nextPath}`;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Permintaan gagal.");
  }

  return data;
}

export function fetchContent() {
  return requestJson("/api/admin/content");
}

export function fetchProducts() {
  return requestJson("/api/admin/products");
}

export function createProduct(payload) {
  return requestJson("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function updateProduct(productId, payload) {
  return requestJson(`/api/admin/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function removeProduct(productId) {
  return requestJson(`/api/admin/products/${productId}`, {
    method: "DELETE"
  });
}

export function updateSettings(payload) {
  return requestJson("/api/admin/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);

  return requestJson("/api/admin/media", {
    method: "POST",
    body: formData
  });
}

export function removeMedia(url) {
  return requestJson("/api/admin/media", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });
}