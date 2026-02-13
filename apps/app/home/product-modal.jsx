import Image from "next/image";
import { buildWhatsAppLink } from "./content-utils";

export default function ProductModal({ product, contactWhatsApp, onClose }) {
  if (!product) {
    return null;
  }

  const detailImage = product.detailImage || product.cardImage || "";

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(18,20,19,0.68)] p-5 animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative grid w-[min(980px,100%)] max-h-[90vh] grid-cols-[minmax(300px,47%)_minmax(0,1fr)] overflow-auto rounded-[22px] bg-white opacity-100 animate-quick-view-in max-md:max-h-full max-md:w-full max-md:grid-cols-1 max-md:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={product.fullName || product.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-[14px] top-[14px] z-10 grid h-10 w-10 place-items-center rounded-full border-0 bg-white/90 text-[1.28rem] leading-none text-gold-500 transition duration-200 hover:scale-[1.04] hover:bg-white"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          X
        </button>
        <div className="relative flex min-h-[530px] bg-white p-3 max-md:min-h-[320px] max-md:p-2.5">
          <div className="relative flex-1 overflow-hidden rounded-[20px] border border-[rgba(31,35,33,0.08)] bg-[radial-gradient(circle_at_20%_20%,#f6f2e8_0%,#ece4cf_100%)] shadow-[0_6px_18px_rgba(31,35,33,0.08)] max-md:rounded-[14px]">
            {detailImage ? (
              <Image
                src={detailImage}
                alt={product.fullName || product.name}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            ) : (
              <div className="grid h-full w-full place-items-center p-4 text-center text-sm text-ink-700">
                Gambar detail belum tersedia
              </div>
            )}
          </div>
        </div>
        <div className="px-[30px] pb-[30px] pt-[34px] max-md:px-5 max-md:pb-6 max-md:pt-6">
          <h3 className="mb-2 font-brand text-[clamp(2rem,4vw,2.8rem)] leading-[1.06]">{product.fullName || product.name}</h3>
          <p className="mb-4 italic text-ink-700">
            <strong></strong> {product.usp}
          </p>
          <p className="leading-[1.6] text-ink-700">{product.description}</p>

          <h4 className="mb-1.5 mt-[18px] text-[1.02rem]">Bahan Utama</h4>
          <ul className="pl-[18px]">
            {(product.ingredients ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4 className="mb-1.5 mt-[18px] text-[1.02rem]">Cara Pakai</h4>
          <p className="leading-[1.6] text-ink-700">{product.usage}</p>

          <a
            className="mt-4 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-transparent bg-[linear-gradient(100deg,#1f7a3f,#239149)] px-5 text-[0.92rem] font-semibold text-white shadow-[0_8px_18px_rgba(35,145,73,0.3)] transition duration-200 hover:-translate-y-px"
            href={buildWhatsAppLink(
              contactWhatsApp,
              `Halo, saya ingin pesan ${product.fullName || product.name}.`,
            )}
          >
            <Image
              src="/logo/whatsapp.png"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain"
            />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
