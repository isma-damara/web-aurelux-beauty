"use client";

import { useEffect, useState } from "react";
import { fetchContent, updateSettings } from "../admin-api";

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
  ghostButton:
    "min-h-[33px] rounded-full border border-gray-300 bg-white px-[11px] text-[0.78rem] text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
  editButton:
    "min-h-[40px] rounded-full border border-gray-900 bg-gray-900 px-[14px] text-[0.9rem] font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
  primaryButton:
    "min-h-[33px] rounded-full border border-gray-900 bg-gray-900 px-[11px] text-[0.78rem] text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
  formGrid: "grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1",
  fullWidth: "col-span-2 max-[860px]:col-span-1",
  buttonRow: "flex flex-wrap gap-[7px]",
  readOnlyGrid: "grid grid-cols-2 gap-2.5 max-[860px]:grid-cols-1",
  readOnlyItem: "grid gap-[5px] rounded-[10px] border border-gray-200 bg-gray-50 p-2.5",
  readOnlyLabel: "m-0 text-[0.72rem] uppercase tracking-[0.05em] text-gray-400",
  readOnlyValue: "m-0 whitespace-pre-wrap break-words text-[0.86rem] leading-[1.42] text-gray-900",
  readOnlyList: "m-0 grid gap-1 pl-[18px] text-[0.86rem] text-gray-900"
};

const labelClass = "grid gap-[5px] text-[0.83rem] text-gray-600";
const inputClass =
  "w-full rounded-[9px] border border-gray-300 bg-white px-[10px] py-[9px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30";
const textareaClass =
  "w-full rounded-[9px] border border-gray-300 bg-white px-[10px] py-[9px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30";

const EMPTY_ABOUT_FORM = {
  title: "",
  description: "",
  highlightsText: ""
};

const EMPTY_CONTACT_FORM = {
  headline: "",
  description: "",
  whatsapp: "",
  email: "",
  phone: "",
  pic: "",
  address: ""
};

const EMPTY_SOCIALS_FORM = {
  instagram: "",
  facebook: "",
  tiktok: ""
};

function highlightsToText(value) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => `${item?.value ?? ""}|${item?.label ?? ""}`)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function textToHighlights(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawValue, ...rawLabel] = line.split("|");
      return {
        value: rawValue?.trim() ?? "",
        label: rawLabel.join("|").trim()
      };
    })
    .filter((item) => item.value || item.label);
}

function mapContentToForms(content) {
  return {
    about: {
      title: content?.about?.title ?? "",
      description: content?.about?.description ?? "",
      highlightsText: highlightsToText(content?.about?.highlights)
    },
    contact: {
      headline: content?.contact?.headline ?? "",
      description: content?.contact?.description ?? "",
      whatsapp: content?.contact?.whatsapp ?? "",
      email: content?.contact?.email ?? "",
      phone: content?.contact?.phone ?? "",
      pic: content?.contact?.pic ?? "",
      address: content?.contact?.address ?? ""
    },
    socials: {
      instagram: content?.socials?.instagram ?? "",
      facebook: content?.socials?.facebook ?? "",
      tiktok: content?.socials?.tiktok ?? ""
    }
  };
}

function buildEditingState(activeSection = "") {
  return {
    about: activeSection === "about",
    contact: activeSection === "contact",
    socials: activeSection === "socials"
  };
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [aboutForm, setAboutForm] = useState(EMPTY_ABOUT_FORM);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM);
  const [socialsForm, setSocialsForm] = useState(EMPTY_SOCIALS_FORM);

  const [initialForms, setInitialForms] = useState({
    about: EMPTY_ABOUT_FORM,
    contact: EMPTY_CONTACT_FORM,
    socials: EMPTY_SOCIALS_FORM
  });

  const [editingSection, setEditingSection] = useState(buildEditingState());

  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadProfileData = async () => {
    setLoading(true);
    setError("");

    try {
      const content = await fetchContent();
      const mapped = mapContentToForms(content);
      setAboutForm(mapped.about);
      setContactForm(mapped.contact);
      setSocialsForm(mapped.socials);
      setInitialForms(mapped);
      setEditingSection(buildEditingState());
    } catch (loadError) {
      setError(loadError.message || "Gagal memuat data profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const openEditSection = (sectionName) => {
    setError("");
    setEditingSection(buildEditingState(sectionName));
  };

  const cancelEditSection = (sectionName) => {
    if (sectionName === "about") {
      setAboutForm(initialForms.about);
    }
    if (sectionName === "contact") {
      setContactForm(initialForms.contact);
    }
    if (sectionName === "socials") {
      setSocialsForm(initialForms.socials);
    }

    setEditingSection(buildEditingState());
  };

  const saveSection = async (payload, successMessage, sectionName) => {
    setIsSaving(true);
    setError("");
    try {
      const saved = await updateSettings(payload);
      const mapped = mapContentToForms(saved);
      setAboutForm(mapped.about);
      setContactForm(mapped.contact);
      setSocialsForm(mapped.socials);
      setInitialForms(mapped);
      setNotice(successMessage);
      setEditingSection(buildEditingState());
    } catch (saveError) {
      setError(saveError.message || "Gagal menyimpan perubahan.");
      if (sectionName) {
        setEditingSection(buildEditingState(sectionName));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Memuat data profil...</div>;
  }

  return (
    <div className={styles.stack}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Menu Profil</p>
        <h1 className={styles.title}>Profil, Kontak, dan Sosial Media</h1>
        <p className={styles.subtitle}>
          Halaman ini mengelola informasi Tentang Kami, detail kontak, dan link sosial media.
        </p>
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}
      {notice ? <div className={styles.notice}>{notice}</div> : null}

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Informasi Tentang Kami</h2>
          {!editingSection.about ? (
            <button type="button" className={styles.editButton} onClick={() => openEditSection("about")} disabled={isSaving}>
              Edit
            </button>
          ) : null}
        </div>

        {!editingSection.about ? (
          <div className={styles.readOnlyGrid}>
            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Judul Tentang</span>
              <p className={styles.readOnlyValue}>{aboutForm.title || "-"}</p>
            </div>

            <div className={`${styles.readOnlyItem} ${styles.fullWidth}`}>
              <span className={styles.readOnlyLabel}>Deskripsi Tentang Kami</span>
              <p className={styles.readOnlyValue}>{aboutForm.description || "-"}</p>
            </div>

            <div className={`${styles.readOnlyItem} ${styles.fullWidth}`}>
              <span className={styles.readOnlyLabel}>Highlights</span>
              {textToHighlights(aboutForm.highlightsText).length === 0 ? (
                <p className={styles.readOnlyValue}>-</p>
              ) : (
                <ul className={styles.readOnlyList}>
                  {textToHighlights(aboutForm.highlightsText).map((item) => (
                    <li key={`${item.value}-${item.label}`}>
                      {item.value} | {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <form
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              saveSection(
                {
                  about: {
                    title: aboutForm.title,
                    description: aboutForm.description,
                    highlights: textToHighlights(aboutForm.highlightsText)
                  }
                },
                "Profil berhasil disimpan.",
                "about"
              );
            }}
          >
            <label className={labelClass}>
              Judul Tentang
              <input
                className={inputClass}
                value={aboutForm.title}
                onChange={(event) => setAboutForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="TENTANG AURELUX BEAUTY"
              />
            </label>

            <label className={`${styles.fullWidth} ${labelClass}`}>
              Deskripsi Tentang Kami
              <textarea
                className={textareaClass}
                rows={4}
                value={aboutForm.description}
                onChange={(event) => setAboutForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className={`${styles.fullWidth} ${labelClass}`}>
              Highlights (format: nilai|label, 1 baris = 1 item)
              <textarea
                className={textareaClass}
                rows={4}
                value={aboutForm.highlightsText}
                onChange={(event) => setAboutForm((prev) => ({ ...prev, highlightsText: event.target.value }))}
                placeholder={"100%|Produk Aman\n2|Produk Unggulan\nBPOM|dan Halal"}
              />
            </label>

            <div className={styles.fullWidth}>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Profil"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={() => cancelEditSection("about")} disabled={isSaving}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Informasi Kontak</h2>
          {!editingSection.contact ? (
            <button type="button" className={styles.editButton} onClick={() => openEditSection("contact")} disabled={isSaving}>
              Edit
            </button>
          ) : null}
        </div>

        {!editingSection.contact ? (
          <div className={styles.readOnlyGrid}>
            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Headline CTA Kontak</span>
              <p className={styles.readOnlyValue}>{contactForm.headline || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Deskripsi CTA Kontak</span>
              <p className={styles.readOnlyValue}>{contactForm.description || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Nomor WhatsApp</span>
              <p className={styles.readOnlyValue}>{contactForm.whatsapp || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Email</span>
              <p className={styles.readOnlyValue}>{contactForm.email || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Nomor Telepon</span>
              <p className={styles.readOnlyValue}>{contactForm.phone || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>PIC</span>
              <p className={styles.readOnlyValue}>{contactForm.pic || "-"}</p>
            </div>

            <div className={`${styles.readOnlyItem} ${styles.fullWidth}`}>
              <span className={styles.readOnlyLabel}>Alamat</span>
              <p className={styles.readOnlyValue}>{contactForm.address || "-"}</p>
            </div>
          </div>
        ) : (
          <form
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              saveSection({ contact: contactForm }, "Kontak berhasil disimpan.", "contact");
            }}
          >
            <label className={labelClass}>
              Headline CTA Kontak
              <input
                className={inputClass}
                value={contactForm.headline}
                onChange={(event) => setContactForm((prev) => ({ ...prev, headline: event.target.value }))}
              />
            </label>

            <label className={labelClass}>
              Deskripsi CTA Kontak
              <input
                className={inputClass}
                value={contactForm.description}
                onChange={(event) => setContactForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className={labelClass}>
              Nomor WhatsApp (format 62812xxxx)
              <input
                className={inputClass}
                value={contactForm.whatsapp}
                onChange={(event) => setContactForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
              />
            </label>

            <label className={labelClass}>
              Email
              <input
                className={inputClass}
                value={contactForm.email}
                onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>

            <label className={labelClass}>
              Nomor Telepon
              <input
                className={inputClass}
                value={contactForm.phone}
                onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>

            <label className={labelClass}>
              PIC
              <input
                className={inputClass}
                value={contactForm.pic}
                onChange={(event) => setContactForm((prev) => ({ ...prev, pic: event.target.value }))}
              />
            </label>

            <label className={`${styles.fullWidth} ${labelClass}`}>
              Alamat
              <textarea
                className={textareaClass}
                rows={3}
                value={contactForm.address}
                onChange={(event) => setContactForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            </label>

            <div className={styles.fullWidth}>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Kontak"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={() => cancelEditSection("contact")} disabled={isSaving}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardToolbar}>
          <h2 className="m-0 text-[0.98rem] text-gray-900">Link Sosial Media</h2>
          {!editingSection.socials ? (
            <button type="button" className={styles.editButton} onClick={() => openEditSection("socials")} disabled={isSaving}>
              Edit
            </button>
          ) : null}
        </div>

        {!editingSection.socials ? (
          <div className={styles.readOnlyGrid}>
            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Instagram</span>
              <p className={styles.readOnlyValue}>{socialsForm.instagram || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>Facebook</span>
              <p className={styles.readOnlyValue}>{socialsForm.facebook || "-"}</p>
            </div>

            <div className={styles.readOnlyItem}>
              <span className={styles.readOnlyLabel}>TikTok</span>
              <p className={styles.readOnlyValue}>{socialsForm.tiktok || "-"}</p>
            </div>
          </div>
        ) : (
          <form
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              saveSection({ socials: socialsForm }, "Sosial media berhasil disimpan.", "socials");
            }}
          >
            <label className={labelClass}>
              Instagram
              <input
                className={inputClass}
                value={socialsForm.instagram}
                onChange={(event) => setSocialsForm((prev) => ({ ...prev, instagram: event.target.value }))}
                placeholder="https://instagram.com/..."
              />
            </label>

            <label className={labelClass}>
              Facebook
              <input
                className={inputClass}
                value={socialsForm.facebook}
                onChange={(event) => setSocialsForm((prev) => ({ ...prev, facebook: event.target.value }))}
                placeholder="https://facebook.com/..."
              />
            </label>

            <label className={labelClass}>
              TikTok
              <input
                className={inputClass}
                value={socialsForm.tiktok}
                onChange={(event) => setSocialsForm((prev) => ({ ...prev, tiktok: event.target.value }))}
                placeholder="https://tiktok.com/@..."
              />
            </label>

            <div className={styles.fullWidth}>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Sosial Media"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={() => cancelEditSection("socials")} disabled={isSaving}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
