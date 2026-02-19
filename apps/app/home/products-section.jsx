import Image from "next/image";
import { buildProductOrderMessage, buildWhatsAppLink } from "./content-utils";

export default function ProductsSection({
  products,
  contactWhatsApp,
  onOpenProduct,
}) {
  const primaryButtonClass =
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-transparent bg-[linear-gradient(100deg,#1f7a3f,#239149)] px-5 text-[0.92rem] font-semibold text-white shadow-[0_8px_18px_rgba(35,145,73,0.3)] transition duration-200 hover:-translate-y-px";
  const ghostButtonClass =
    "inline-flex min-h-[42px] items-center justify-center rounded-full border border-[rgba(181,140,55,0.72)] bg-white/90 px-5 text-[0.92rem] font-semibold text-[#8e6f26] transition duration-200 hover:-translate-y-px";

  return (
    <section
      id="produk"
      className="reveal px-[min(6vw,70px)] py-24 max-md:px-[18px]"
    >
      <div className="mb-[34px] text-center">
        <p className="m-0 font-script text-[clamp(1.45rem,3vw,2.2rem)] tracking-[0.03em] text-gold-500">
          our products
        </p>
        <h2 className="mt-1.5 font-brand text-[clamp(1.9rem,3.8vw,3rem)] tracking-[0.08em]">
          PRODUK UNGGULAN
        </h2>
      </div>

      <div className="mx-auto grid w-[min(1150px,100%)] grid-cols-2 gap-[clamp(18px,3.2vw,32px)] max-[992px]:grid-cols-1">
        {products.length === 0 ? (
          <div className="col-span-full grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-[#8e6f26]/35 bg-white/70 p-6 text-center text-ink-700">
            Produk belum tersedia.
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_34px_rgba(31,35,33,0.08)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,#f7f5ef_0%,#f0ece1_100%)]">
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {product.cardImage ? (
                    <img
                      src={product.cardImage}
                      alt={product.fullName || product.name}
                      className="h-full w-full p-[18px] object-contain object-center transition-transform duration-300 group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center p-6 text-center text-sm text-ink-700">
                      Gambar produk belum tersedia
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 z-[3] flex items-center gap-2">
                  {[
                    { src: "/logo/Bpom.png", alt: "Logo BPOM" },
                    { src: "/logo/Halal.png", alt: "Logo Halal" },
                  ].map((logo) => (
                    <div
                      key={logo.src}
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[rgba(181,140,55,0.35)] bg-white/95 p-2 shadow-[0_6px_14px_rgba(31,35,33,0.12)]"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={100}
                        height={100}
                        className="h-[39px] w-[39px] object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col px-[22px] pb-[26px] pt-[22px] text-center">
                <h3 className="font-brand text-[clamp(1.65rem,3.3vw,2.25rem)] leading-[1.12]">
                  {product.name}
                </h3>
                <p className="mx-auto mt-3 max-w-[52ch] text-ink-700">
                  {product.usp}
                </p>
                <ul className="mx-auto mt-3.5 grid max-w-[440px] list-none gap-[7px] p-0">
                  {product.shortList.map((item) => (
                    <li key={item} className="text-ink-700">
                      <span className="font-bold text-leaf-700">+ </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5 border-t border-[rgba(31,35,33,0.08)] pt-4 [&>*]:flex-1">
                    <button
                      className={ghostButtonClass}
                      type="button"
                      onClick={() => onOpenProduct(product)}
                    >
                      Quick View
                    </button>
                    <a
                      className={primaryButtonClass}
                      href={buildWhatsAppLink(
                        contactWhatsApp,
                        buildProductOrderMessage(product),
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
            </article>
          ))
        )}
      </div>
    </section>
  );
}
