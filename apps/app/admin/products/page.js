"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  fetchProducts,
  removeMedia,
  removeProduct,
  updateProduct,
  uploadMedia
} from "../admin-api";

const styles = {
  loading: "grid min-h-[200px] place-items-center rounded-xl border border-dashed border-gray-300 text-[0.9rem] text-gray-500",
  stack: "grid gap-4",
  header: "border-b border-[#edf0f3] px-0.5 pb-2.5 pt-0.5",
  eyebrow: "m-0 text-[0.72rem] uppercase tracking-[0.08em] text-gray-400",
  title: "mt-1.5 text-[clamp(1.26rem,1.7vw,1.62rem)] font-bold text-gray-900",
  subtitle: "mt-1.5 text-[0.88rem] text-gray-500",
  error: "rounded-[10px] border border-red-200 bg-red-50 px-[11px] py-[9px] text-[0.86rem] text-red-700",
  notice: "rounded-[10px] border border-emerald-900/20 bg-emerald-50 px-[11px] py-[9px] text-[0.86rem] text-emerald-800",
  card: "grid gap-3 rounded-xl border border-gray-200 bg-white p-[14px]",
  cardToolbar: "flex flex-wrap items-center justify-between gap-2.5",
  primaryButton:
    "min-h-[33px] rounded-full border border-gray-900 bg-gray-900 px-[11px] text-[0.78rem] text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
  editButton:
    "min-h-[40px] rounded-full border border-gray-900 bg-gray-900 px-[14px] text-[0.9rem] font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
  ghostButton:
    "min-h-[33px] rounded-full border border-gray-300 bg-white px-[11px] text-[0.78rem] text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
  deleteButton:
    "min-h-[40px] rounded-full border border-red-200 bg-red-50 px-[14px] text-[0.9rem] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60",
  dangerButton:
    "min-h-[33px] rounded-full border border-red-200 bg-red-50 px-[11px] text-[0.78rem] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60",
  tableWrap: "overflow-hidden rounded-[10px] border border-gray-200 bg-white max-[960px]:overflow-visible max-[960px]:border-0",
  tableHead:
    "grid grid-cols-[120px_minmax(190px,1.35fr)_minmax(190px,1.45fr)_minmax(130px,0.85fr)] items-center gap-[9px] border-b border-gray-200 bg-gray-50 px-[11px] py-[10px] text-[0.72rem] uppercase tracking-[0.05em] text-gray-500 max-[960px]:hidden",
  empty: "m-0 p-3 text-[0.86rem] text-gray-500",
  tableRow:
    "grid grid-cols-[120px_minmax(190px,1.35fr)_minmax(190px,1.45fr)_minmax(130px,0.85fr)] items-center gap-[9px] border-b border-[#edf0f3] px-[11px] py-[10px] last:border-b-0 max-[960px]:mb-2 max-[960px]:grid-cols-1 max-[960px]:gap-1.5 max-[960px]:rounded-[10px] max-[960px]:border max-[960px]:border-gray-200",
  tableCode: "text-[0.8rem] text-gray-500",
  tableName: "text-[0.87rem] font-semibold text-gray-900",
  tableUsp: "truncate whitespace-nowrap text-[0.83rem] text-gray-500",
  inlineActions: "flex gap-1.5",
  helperText: "m-0 text-[0.84rem] text-gray-500",
  modalBackdrop: "fixed inset-0 z-[90] grid place-items-center bg-[rgba(18,20,19,0.68)] p-5 animate-fade-in",
  modalCard:
    "grid max-h-[92vh] w-[min(860px,100%)] gap-3 overflow-auto rounded-2xl border border-white/50 bg-white/90 p-[14px] shadow-[0_20px_50px_rgba(15,23,42,0.28)] backdrop-blur-sm animate-quick-view-in max-[860px]:p-3",
  modalHeader: "flex items-center justify-between gap-2.5",
  formGrid: "grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1",
  fullWidth: "col-span-2 max-[860px]:col-span-1",
  mediaBlock: "grid gap-2 rounded-[10px] border border-dashed border-gray-300 p-2.5",
  mediaLabel: "m-0 text-[0.83rem] font-semibold text-gray-700",
  mediaPreviewFrame: "min-h-[96px] w-full overflow-hidden rounded-[9px] border border-gray-200 bg-white",
  mediaPreviewImage: "block min-h-[96px] h-full w-full object-contain",
  mediaPlaceholder: "grid min-h-[96px] place-items-center rounded-[9px] border border-dashed border-gray-300 p-2.5 text-center text-[0.82rem] text-gray-500",
  mediaActions: "flex flex-wrap gap-[7px]",
  uploadButton:
    "inline-flex min-h-[33px] cursor-pointer items-center rounded-full border border-gray-300 bg-white px-[11px] text-[0.78rem] text-gray-700 transition hover:bg-gray-50",
  buttonRow: "flex flex-wrap gap-[7px]"
};

const labelClass = "grid gap-[5px] text-[0.83rem] text-gray-600";
const inputClass =
  "w-full rounded-[9px] border border-gray-300 bg-white px-[10px] py-[9px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30";
const textareaClass =
  "w-full rounded-[9px] border border-gray-300 bg-white px-[10px] py-[9px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30";

const EMPTY_PRODUCT_FORM = {
  name: "",
  fullName: "",
  cardImage: "",
  detailImage: "",
  usp: "",
  shortListText: "",
  description: "",
  ingredientsText: "",
  usage: ""
};

function listToText(value) {
  if (!Array.isArray(value)) {
    return "";
  }
  return value.join("\n");
}

function textToList(value) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapProductToForm(product) {
  return {
    name: product?.name ?? "",
    fullName: product?.fullName ?? "",
    cardImage: product?.cardImage ?? "",
    detailImage: product?.detailImage ?? "",
    usp: product?.usp ?? "",
    shortListText: listToText(product?.shortList),
    description: product?.description ?? "",
    ingredientsText: listToText(product?.ingredients),
    usage: product?.usage ?? ""
  };
}

function mapFormToProductPayload(form) {
  return {
    name: form.name.trim(),
    fullName: form.fullName.trim(),
    cardImage: form.cardImage.trim(),
    detailImage: form.detailImage.trim(),
    usp: form.usp.trim(),
    shortList: textToList(form.shortListText),
    description: form.description.trim(),
    ingredients: textToList(form.ingredientsText),
    usage: form.usage.trim()
  };
}

function MediaPreview({ url, alt, emptyText }) {
  if (!url) {
    return <div className={styles.mediaPlaceholder}>{emptyText}</div>;
  }

  return (
    <div className={styles.mediaPreviewFrame}>
      <img src={url} alt={alt} className={styles.mediaPreviewImage} />
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadingField, setUploadingField] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);

  const titleText = useMemo(() => (editingProductId ? "Update Produk" : "Tambah Produk"), [editingProductId]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!isFormOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  const onResetForm = () => {
    setEditingProductId("");
    setProductForm(EMPTY_PRODUCT_FORM);
    setUploadingField("");
  };

  const onOpenCreateModal = () => {
    onResetForm();
    setError("");
    setIsFormOpen(true);
  };

  const onCloseFormModal = () => {
    if (isSaving) {
      return;
    }

    onResetForm();
    setIsFormOpen(false);
  };

  const onSubmitProduct = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = mapFormToProductPayload(productForm);
      if (!payload.name || !payload.fullName) {
        throw new Error("Nama produk dan nama lengkap wajib diisi.");
      }

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setNotice("Produk berhasil diperbarui.");
      } else {
        await createProduct(payload);
        setNotice("Produk baru berhasil ditambahkan.");
      }

      await loadProducts();
      onResetForm();
      setIsFormOpen(false);
    } catch (saveError) {
      setError(saveError.message || "Gagal menyimpan produk.");
    } finally {
      setIsSaving(false);
    }
  };

  const onEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm(mapProductToForm(product));
    setError("");
    setIsFormOpen(true);
  };

  const onDeleteProduct = async (product) => {
    const isConfirmed = window.confirm(`Hapus produk "${product.fullName || product.name}"?`);
    if (!isConfirmed) {
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await removeProduct(product.id);

      if (product.cardImage?.startsWith("/uploads/")) {
        await removeMedia(product.cardImage);
      }
      if (product.detailImage?.startsWith("/uploads/") && product.detailImage !== product.cardImage) {
        await removeMedia(product.detailImage);
      }

      await loadProducts();
      if (editingProductId === product.id) {
        onResetForm();
        setIsFormOpen(false);
      }
      setNotice("Produk berhasil dihapus.");
    } catch (deleteError) {
      setError(deleteError.message || "Gagal menghapus produk.");
    } finally {
      setIsSaving(false);
    }
  };

  const onUploadToField = async (field, file) => {
    if (!file) {
      return;
    }

    setUploadingField(field);
    setError("");
    try {
      const uploaded = await uploadMedia(file);
      setProductForm((prev) => ({
        ...prev,
        [field]: uploaded.url
      }));
      setNotice("Upload media produk berhasil.");
    } catch (uploadError) {
      setError(uploadError.message || "Gagal upload media.");
    } finally {
      setUploadingField("");
    }
  };

  const onRemoveFieldMedia = async (field) => {
    const url = productForm[field];
    if (!url) {
      return;
    }

    if (url.startsWith("/uploads/")) {
      try {
        await removeMedia(url);
      } catch (_error) {
        setError("Media dihapus dari form, namun gagal dihapus dari storage.");
      }
    }

    setProductForm((prev) => ({ ...prev, [field]: "" }));
  };

  if (loading) {
    return <div className={styles.loading}>Memuat data produk...</div>;
  }

  return (
    <div className={styles.stack}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Menu Produk</p>
        <h1 className={styles.title}>Manajemen Produk dan Gambar</h1>
        <p className={styles.subtitle}>
          Halaman ini mengelola seluruh data produk sekaligus gambar card/detail produk.
        </p>
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}
      {notice ? <div className={styles.notice}>{notice}</div> : null}

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Daftar Produk</h2>
          <button type="button" className={styles.primaryButton} onClick={onOpenCreateModal}>
            Tambah Produk
          </button>
        </div>
        <div className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <span>ID</span>
            <span>Nama</span>
            <span>USP</span>
            <span>Aksi</span>
          </div>
          {products.length === 0 ? (
            <p className={styles.empty}>Belum ada produk.</p>
          ) : (
            products.map((product) => (
              <article key={product.id} className={styles.tableRow}>
                <span className={styles.tableCode}>#{product.id}</span>
                <span className={styles.tableName}>{product.fullName || product.name}</span>
                <span className={styles.tableUsp}>{product.usp}</span>
                <span className={styles.inlineActions}>
                  <button type="button" className={styles.editButton} onClick={() => onEditProduct(product)}>
                    Edit
                  </button>
                  <button type="button" className={styles.deleteButton} onClick={() => onDeleteProduct(product)}>
                    Hapus
                  </button>
                </span>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className="m-0 text-[0.98rem] text-gray-900">Catatan Manajemen Gambar</h2>
        <p className={styles.helperText}>
          Manajemen gambar produk sudah terintegrasi di form produk. Media ditampilkan sebagai preview agar admin lebih
          mudah mengecek hasil upload.
        </p>
      </section>

      {isFormOpen ? (
        <div className={styles.modalBackdrop} onClick={onCloseFormModal}>
          <section className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className="m-0 text-base">{titleText}</h2>
              <div className={styles.buttonRow}>
                <button type="submit" form="admin-product-form" className={styles.primaryButton} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : editingProductId ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={onCloseFormModal} disabled={isSaving}>
                  Tutup
                </button>
              </div>
            </div>

            <form id="admin-product-form" onSubmit={onSubmitProduct} className={styles.formGrid}>
              <label className={labelClass}>
                Nama Produk
                <input
                  className={inputClass}
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Brightening Face Spray Toner"
                />
              </label>

              <label className={labelClass}>
                Nama Lengkap Produk
                <input
                  className={inputClass}
                  value={productForm.fullName}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Aurelux Brightening Face Spray Toner"
                />
              </label>

              <label className={`${styles.fullWidth} ${labelClass}`}>
                USP
                <input
                  className={inputClass}
                  value={productForm.usp}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, usp: event.target.value }))}
                  placeholder="USP produk"
                />
              </label>

              <label className={`${styles.fullWidth} ${labelClass}`}>
                Deskripsi
                <textarea
                  className={textareaClass}
                  rows={4}
                  value={productForm.description}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <label className={`${styles.fullWidth} ${labelClass}`}>
                Highlight Produk (1 baris = 1 poin)
                <textarea
                  className={textareaClass}
                  rows={4}
                  value={productForm.shortListText}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, shortListText: event.target.value }))}
                  placeholder={"Niacinamide\nCeramide NP"}
                />
              </label>

              <label className={`${styles.fullWidth} ${labelClass}`}>
                Bahan Utama (1 baris = 1 poin)
                <textarea
                  className={textareaClass}
                  rows={4}
                  value={productForm.ingredientsText}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, ingredientsText: event.target.value }))}
                  placeholder={"Niacinamide\nCeramide NP"}
                />
              </label>

              <label className={`${styles.fullWidth} ${labelClass}`}>
                Cara Pakai
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={productForm.usage}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, usage: event.target.value }))}
                />
              </label>

              <div className={styles.mediaBlock}>
                <p className={styles.mediaLabel}>Gambar Card</p>
                <MediaPreview
                  url={productForm.cardImage}
                  alt={productForm.fullName || productForm.name || "Gambar card produk"}
                  emptyText="Belum ada gambar card."
                />
                <label className={labelClass}>
                  URL Gambar Card (opsional)
                  <input
                    className={inputClass}
                    value={productForm.cardImage}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, cardImage: event.target.value }))}
                    placeholder="https://cdn.example.com/product-card.jpg"
                  />
                </label>
                <div className={styles.mediaActions}>
                  <label className={styles.uploadButton}>
                    Upload Gambar Card
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={(event) => onUploadToField("cardImage", event.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onRemoveFieldMedia("cardImage")}
                    disabled={!productForm.cardImage || uploadingField === "cardImage"}
                  >
                    Hapus Gambar Card
                  </button>
                </div>
              </div>

              <div className={styles.mediaBlock}>
                <p className={styles.mediaLabel}>Gambar Detail</p>
                <MediaPreview
                  url={productForm.detailImage}
                  alt={productForm.fullName || productForm.name || "Gambar detail produk"}
                  emptyText="Belum ada gambar detail."
                />
                <label className={labelClass}>
                  URL Gambar Detail (opsional)
                  <input
                    className={inputClass}
                    value={productForm.detailImage}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, detailImage: event.target.value }))}
                    placeholder="https://cdn.example.com/product-detail.jpg"
                  />
                </label>
                <div className={styles.mediaActions}>
                  <label className={styles.uploadButton}>
                    Upload Gambar Detail
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={(event) => onUploadToField("detailImage", event.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onRemoveFieldMedia("detailImage")}
                    disabled={!productForm.detailImage || uploadingField === "detailImage"}
                  >
                    Hapus Gambar Detail
                  </button>
                </div>
              </div>

            </form>

          </section>
        </div>
      ) : null}
    </div>
  );
}
