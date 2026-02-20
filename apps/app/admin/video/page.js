"use client";

import { useEffect, useState } from "react";
import { fetchContent, removeMedia, updateSettings, uploadMedia } from "../admin-api";

const styles = {
  loading: "grid min-h-[200px] place-items-center rounded-xl border border-dashed border-gray-300 text-[0.9rem] text-gray-500",
  stack: "grid gap-4",
  header: "border-b border-[#edf0f3] px-0.5 pb-2.5 pt-0.5",
  eyebrow: "m-0 text-[0.72rem] uppercase tracking-[0.08em] text-gray-400",
  title: "mt-1.5 text-[clamp(1.26rem,1.7vw,1.62rem)] font-bold text-gray-900",
  subtitle: "mt-1.5 text-[0.88rem] text-gray-500",
  error: "rounded-[10px] border border-red-200 bg-red-50 px-[11px] py-[9px] text-[0.86rem] text-red-700",
  notice: "rounded-[10px] border border-emerald-900/20 bg-emerald-50 px-[11px] py-[9px] text-[0.86rem] text-emerald-800",
  card: "grid gap-3 rounded-xl border border-gray-200 bg-white p-[14px] max-[640px]:p-3",
  cardToolbar: "flex flex-wrap items-center justify-between gap-2.5 max-[640px]:items-stretch",
  readOnlyGrid: "grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1",
  readOnlyItem: "grid gap-[5px] rounded-[10px] border border-gray-200 bg-gray-50 p-2.5",
  readOnlyLabel: "m-0 text-[0.72rem] uppercase tracking-[0.05em] text-gray-400",
  readOnlyValue: "m-0 whitespace-pre-wrap break-words text-[0.86rem] leading-[1.42] text-gray-900",
  formGrid: "grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1",
  fullWidth: "col-span-2 max-[860px]:col-span-1",
  mediaBlock: "grid gap-2 rounded-[10px] border border-dashed border-gray-300 p-2.5",
  mediaLabel: "m-0 text-[0.83rem] font-semibold text-gray-700",
  mediaPreviewRow: "flex items-center gap-3 max-[640px]:grid",
  mediaPreviewFrame:
    "h-[84px] w-[132px] shrink-0 overflow-hidden rounded-[9px] border border-gray-200 bg-white max-[640px]:h-[180px] max-[640px]:w-full",
  mediaPreviewImage: "block h-full w-full object-cover",
  mediaPreviewVideo: "block h-full w-full bg-black",
  mediaPlaceholder: "grid min-h-[84px] place-items-center rounded-[9px] border border-dashed border-gray-300 p-2.5 text-center text-[0.82rem] text-gray-500",
  mediaPreviewMeta: "grid gap-1",
  mediaPreviewCaption: "text-[0.78rem] text-gray-500",
  uploadStatus: "m-0 flex items-center gap-1.5 text-[0.74rem] text-gray-500",
  uploadSpinner:
    "inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700",
  viewButton:
    "inline-flex min-h-[36px] items-center justify-center rounded-full border border-gray-300 bg-white px-[12px] text-[0.8rem] font-medium text-gray-700 transition hover:bg-gray-50 max-[640px]:w-full",
  mediaActions: "flex flex-wrap gap-[7px] max-[640px]:grid max-[640px]:grid-cols-1",
  uploadButton:
    "inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-gray-300 bg-white px-[12px] text-[0.8rem] text-gray-700 transition hover:bg-gray-50 max-[640px]:w-full max-[640px]:justify-center",
  uploadButtonDisabled: "pointer-events-none cursor-not-allowed opacity-60",
  buttonRow: "flex flex-wrap gap-[7px] max-[640px]:grid max-[640px]:grid-cols-1",
  primaryButton:
    "min-h-[36px] rounded-full border border-gray-900 bg-gray-900 px-[12px] text-[0.8rem] text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:w-full",
  editButton:
    "min-h-[40px] rounded-full border border-gray-900 bg-gray-900 px-[14px] text-[0.9rem] font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:w-full",
  deleteButton:
    "min-h-[40px] rounded-full border border-red-200 bg-red-50 px-[14px] text-[0.9rem] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:w-full",
  ghostButton:
    "min-h-[36px] rounded-full border border-gray-300 bg-white px-[12px] text-[0.8rem] text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:w-full",
  viewerBackdrop: "fixed inset-0 z-[95] grid place-items-center bg-slate-900/60 p-4",
  viewerCard:
    "grid w-[min(900px,100%)] gap-3 rounded-2xl bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.35)] max-[640px]:p-3",
  viewerHead: "flex items-center justify-between gap-2",
  viewerTitle: "text-[0.95rem] font-semibold text-gray-900",
  viewerBody: "overflow-hidden rounded-xl border border-gray-200 bg-slate-50"
};

const labelClass = "grid gap-[5px] text-[0.83rem] text-gray-600";
const textareaClass =
  "w-full rounded-[9px] border border-gray-300 bg-white px-[10px] py-[9px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30";

function MediaPreview({ url, type, alt, emptyText, onView }) {
  if (!url) {
    return <div className={styles.mediaPlaceholder}>{emptyText}</div>;
  }

  return (
    <div className={styles.mediaPreviewRow}>
      <div className={styles.mediaPreviewFrame}>
        {type === "video" ? (
          <video className={styles.mediaPreviewVideo} muted preload="metadata">
            <source src={url} type="video/mp4" />
          </video>
        ) : (
          <img src={url} alt={alt} className={styles.mediaPreviewImage} />
        )}
      </div>
      <div className={styles.mediaPreviewMeta}>
        <span className={styles.mediaPreviewCaption}>Preview media</span>
        <button type="button" className={styles.viewButton} onClick={onView}>
          View
        </button>
      </div>
    </div>
  );
}

export default function AdminVideoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [editingSection, setEditingSection] = useState("");
  const [viewerMedia, setViewerMedia] = useState(null);

  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    videoUrl: "",
    promoVideoUrl: "",
    posterImage: "",
    heroProductImage: ""
  });
  const [initialHeroForm, setInitialHeroForm] = useState({
    title: "",
    subtitle: "",
    videoUrl: "",
    promoVideoUrl: "",
    posterImage: "",
    heroProductImage: ""
  });
  const isUploadingAny = Boolean(uploadingField);
  const isUploadingVideo = uploadingField === "videoUrl";
  const isUploadingPromoVideo = uploadingField === "promoVideoUrl";
  const isUploadingHeroImage = uploadingField === "heroProductImage";

  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadVideoData = async () => {
    setLoading(true);
    setError("");
    try {
      const content = await fetchContent();
      const mapped = {
        title: content?.hero?.title ?? "",
        subtitle: content?.hero?.subtitle ?? "",
        videoUrl: content?.hero?.videoUrl ?? "",
        promoVideoUrl: content?.hero?.promoVideoUrl ?? "",
        posterImage: content?.hero?.posterImage ?? "",
        heroProductImage: content?.hero?.heroProductImage ?? ""
      };
      setHeroForm(mapped);
      setInitialHeroForm(mapped);
      setEditingSection("");
    } catch (loadError) {
      setError(loadError.message || "Gagal memuat data banner.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideoData();
  }, []);

  const onUploadToField = async (field, file) => {
    if (!file) {
      return;
    }
    setUploadingField(field);
    setError("");
    try {
      const uploaded = await uploadMedia(file);
      setHeroForm((prev) => ({
        ...prev,
        [field]: uploaded.url
      }));
      setNotice("Upload media banner berhasil.");
    } catch (uploadError) {
      setError(uploadError.message || "Gagal upload media banner.");
    } finally {
      setUploadingField("");
    }
  };

  const onRemoveFieldMedia = async (field) => {
    const url = heroForm[field];
    if (!url) {
      return;
    }

    try {
      await removeMedia(url);
    } catch (_error) {
      setError("Media dihapus dari form, namun gagal dihapus dari storage.");
    }

    setHeroForm((prev) => ({
      ...prev,
      [field]: ""
    }));
  };

  const onSaveSection = async (payload, successMessage) => {
    setIsSaving(true);
    setError("");
    try {
      const saved = await updateSettings(payload);
      const mapped = {
        title: saved?.hero?.title ?? "",
        subtitle: saved?.hero?.subtitle ?? "",
        videoUrl: saved?.hero?.videoUrl ?? "",
        promoVideoUrl: saved?.hero?.promoVideoUrl ?? "",
        posterImage: saved?.hero?.posterImage ?? "",
        heroProductImage: saved?.hero?.heroProductImage ?? ""
      };
      setHeroForm(mapped);
      setInitialHeroForm(mapped);
      setEditingSection("");
      setNotice(successMessage);
    } catch (saveError) {
      setError(saveError.message || "Gagal menyimpan konten banner.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveText = async (event) => {
    event.preventDefault();
    await onSaveSection(
      {
        hero: {
          title: heroForm.title,
          subtitle: heroForm.subtitle
        }
      },
      "Judul dan subjudul banner berhasil disimpan."
    );
  };

  const onSaveMedia = async (event) => {
    event.preventDefault();
    await onSaveSection(
      {
        hero: {
          videoUrl: heroForm.videoUrl,
          promoVideoUrl: heroForm.promoVideoUrl,
          posterImage: heroForm.posterImage,
          heroProductImage: heroForm.heroProductImage
        }
      },
      "Media banner berhasil disimpan."
    );
  };

  const onOpenEdit = (sectionName) => {
    setError("");
    setEditingSection(sectionName);
  };

  const onCancelEdit = (sectionName) => {
    if (isSaving) {
      return;
    }

    if (sectionName === "text") {
      setHeroForm((prev) => ({
        ...prev,
        title: initialHeroForm.title,
        subtitle: initialHeroForm.subtitle
      }));
    }

    if (sectionName === "media") {
      setHeroForm((prev) => ({
        ...prev,
        videoUrl: initialHeroForm.videoUrl,
        promoVideoUrl: initialHeroForm.promoVideoUrl,
        posterImage: initialHeroForm.posterImage,
        heroProductImage: initialHeroForm.heroProductImage
      }));
    }

    setEditingSection("");
  };

  if (loading) {
    return <div className={styles.loading}>Memuat data video banner...</div>;
  }

  return (
    <div className={styles.stack}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Menu Video Banner</p>
        <h1 className={styles.title}>Manajemen Video Banner</h1>
        <p className={styles.subtitle}>Upload atau ganti video banner, video promo, serta gambar produk banner untuk halaman utama.</p>
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}
      {notice ? <div className={styles.notice}>{notice}</div> : null}

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Teks Banner</h2>
          {editingSection !== "text" ? (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => onOpenEdit("text")}
              disabled={isSaving || isUploadingAny || editingSection === "media"}
            >
              Edit
            </button>
          ) : null}
        </div>

        {editingSection !== "text" ? (
          <div className={styles.readOnlyGrid}>
            <div className={`${styles.readOnlyItem} ${styles.fullWidth}`}>
              <span className={styles.readOnlyLabel}>Judul Banner</span>
              <p className={styles.readOnlyValue}>{heroForm.title || "-"}</p>
            </div>

            <div className={`${styles.readOnlyItem} ${styles.fullWidth}`}>
              <span className={styles.readOnlyLabel}>Subtitle Banner</span>
              <p className={styles.readOnlyValue}>{heroForm.subtitle || "-"}</p>
            </div>
          </div>
        ) : (
          <form className={styles.formGrid} onSubmit={onSaveText}>
            <label className={`${styles.fullWidth} ${labelClass}`}>
              Judul Banner (gunakan Enter untuk baris baru)
              <textarea
                className={textareaClass}
                rows={3}
                value={heroForm.title}
                onChange={(event) => setHeroForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>

            <label className={`${styles.fullWidth} ${labelClass}`}>
              Subtitle Banner
              <textarea
                className={textareaClass}
                rows={3}
                value={heroForm.subtitle}
                onChange={(event) => setHeroForm((prev) => ({ ...prev, subtitle: event.target.value }))}
              />
            </label>

            <div className={styles.fullWidth}>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Teks Banner"}
                </button>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => onCancelEdit("text")}
                  disabled={isSaving || isUploadingAny}
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Media Banner</h2>
          {editingSection !== "media" ? (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => onOpenEdit("media")}
              disabled={isSaving || isUploadingAny || editingSection === "text"}
            >
              Edit
            </button>
          ) : null}
        </div>

        {editingSection !== "media" ? (
          <div className={styles.readOnlyGrid}>
            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Video Banner</span>
              <MediaPreview
                url={heroForm.videoUrl}
                type="video"
                emptyText="Belum ada video banner."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.videoUrl,
                    type: "video",
                    title: "Video Banner"
                  })
                }
              />
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Video Promo</span>
              <MediaPreview
                url={heroForm.promoVideoUrl}
                type="video"
                emptyText="Belum ada video promo."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.promoVideoUrl,
                    type: "video",
                    title: "Video Promo"
                  })
                }
              />
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Gambar Produk Banner</span>
              <MediaPreview
                url={heroForm.heroProductImage}
                alt="Gambar produk banner"
                emptyText="Belum ada gambar produk banner."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.heroProductImage,
                    type: "image",
                    title: "Gambar Produk Banner"
                  })
                }
              />
            </div>
          </div>
        ) : (
          <form className={styles.formGrid} onSubmit={onSaveMedia}>
            <div className={styles.mediaBlock}>
              <p className={styles.mediaLabel}>Video Banner</p>
              <MediaPreview
                url={heroForm.videoUrl}
                type="video"
                emptyText="Belum ada video banner."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.videoUrl,
                    type: "video",
                    title: "Video Banner"
                  })
                }
              />
              <div className={styles.mediaActions}>
                <label
                  className={`${styles.uploadButton} ${isUploadingAny || isSaving ? styles.uploadButtonDisabled : ""}`}
                >
                  {isUploadingVideo ? "Mengupload Video Banner..." : "Upload Video Banner"}
                  <input
                    className="hidden"
                    type="file"
                    accept="video/*"
                    onChange={(event) => {
                      onUploadToField("videoUrl", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    disabled={isUploadingAny || isSaving}
                  />
                </label>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onRemoveFieldMedia("videoUrl")}
                  disabled={!heroForm.videoUrl || isUploadingAny || isSaving}
                >
                  Hapus Video
                </button>
              </div>
              {isUploadingVideo ? (
                <p className={styles.uploadStatus}>
                  <span className={styles.uploadSpinner} aria-hidden="true" />
                  Sedang upload video banner, mohon tunggu...
                </p>
              ) : null}
            </div>

            <div className={styles.mediaBlock}>
              <p className={styles.mediaLabel}>Video Promo</p>
              <MediaPreview
                url={heroForm.promoVideoUrl}
                type="video"
                emptyText="Belum ada video promo."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.promoVideoUrl,
                    type: "video",
                    title: "Video Promo"
                  })
                }
              />
              <div className={styles.mediaActions}>
                <label
                  className={`${styles.uploadButton} ${isUploadingAny || isSaving ? styles.uploadButtonDisabled : ""}`}
                >
                  {isUploadingPromoVideo ? "Mengupload Video Promo..." : "Upload Video Promo"}
                  <input
                    className="hidden"
                    type="file"
                    accept="video/*"
                    onChange={(event) => {
                      onUploadToField("promoVideoUrl", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    disabled={isUploadingAny || isSaving}
                  />
                </label>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onRemoveFieldMedia("promoVideoUrl")}
                  disabled={!heroForm.promoVideoUrl || isUploadingAny || isSaving}
                >
                  Hapus Video Promo
                </button>
              </div>
              {isUploadingPromoVideo ? (
                <p className={styles.uploadStatus}>
                  <span className={styles.uploadSpinner} aria-hidden="true" />
                  Sedang upload video promo, mohon tunggu...
                </p>
              ) : null}
            </div>

            <div className={styles.mediaBlock}>
              <p className={styles.mediaLabel}>Gambar Produk Banner</p>
              <MediaPreview
                url={heroForm.heroProductImage}
                alt="Gambar produk banner"
                emptyText="Belum ada gambar produk banner."
                onView={() =>
                  setViewerMedia({
                    url: heroForm.heroProductImage,
                    type: "image",
                    title: "Gambar Produk Banner"
                  })
                }
              />
              <div className={styles.mediaActions}>
                <label
                  className={`${styles.uploadButton} ${isUploadingAny || isSaving ? styles.uploadButtonDisabled : ""}`}
                >
                  {isUploadingHeroImage ? "Mengupload Gambar Banner..." : "Upload Gambar Banner"}
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      onUploadToField("heroProductImage", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    disabled={isUploadingAny || isSaving}
                  />
                </label>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onRemoveFieldMedia("heroProductImage")}
                  disabled={!heroForm.heroProductImage || isUploadingAny || isSaving}
                >
                  Hapus Gambar Banner
                </button>
              </div>
              {isUploadingHeroImage ? (
                <p className={styles.uploadStatus}>
                  <span className={styles.uploadSpinner} aria-hidden="true" />
                  Sedang upload gambar banner, mohon tunggu...
                </p>
              ) : null}
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving || isUploadingAny}>
                  {isSaving ? "Menyimpan..." : isUploadingAny ? "Menunggu Upload..." : "Simpan Media Banner"}
                </button>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => onCancelEdit("media")}
                  disabled={isSaving || isUploadingAny}
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {viewerMedia ? (
        <div className={styles.viewerBackdrop} onClick={() => setViewerMedia(null)}>
          <section className={styles.viewerCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.viewerHead}>
              <p className={styles.viewerTitle}>{viewerMedia.title}</p>
              <button type="button" className={styles.ghostButton} onClick={() => setViewerMedia(null)}>
                Tutup
              </button>
            </div>
            <div className={styles.viewerBody}>
              {viewerMedia.type === "video" ? (
                <video className="block max-h-[70vh] w-full bg-black" controls preload="metadata" autoPlay>
                  <source src={viewerMedia.url} type="video/mp4" />
                </video>
              ) : (
                <img src={viewerMedia.url} alt={viewerMedia.title} className="block max-h-[70vh] w-full object-contain" />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
