import Image from "next/image";

function resolveHighlight(item, productCount) {
  const rawText = `${item?.value || ""} ${item?.label || ""}`.toLowerCase();

  if (rawText.includes("produk unggulan")) {
    return {
      type: "text",
      value: String(productCount),
      label: "Produk Unggulan"
    };
  }

  if (rawText.includes("bpom") || rawText.includes("halal")) {
    return {
      type: "certification",
      label: "BPOM & Halal"
    };
  }

  if (rawText.includes("aman") || rawText.includes("100%")) {
    return {
      type: "shield",
      label: "100% Aman"
    };
  }

  return {
    type: "text",
    value: item?.value || "",
    label: item?.label || ""
  };
}

export default function AboutSection({ about, productCount = 0 }) {
  return (
    <section
      id="tentang"
      className="reveal mt-4 px-6 pb-[94px] pt-[84px] text-center max-md:px-5"
      style={{
        background:
          "radial-gradient(circle at left 12% top 18%, rgba(156, 186, 141, 0.24), transparent 28%), radial-gradient(circle at right 10% bottom 15%, rgba(156, 186, 141, 0.24), transparent 32%), linear-gradient(180deg, #fbf8f0 0%, #f7f3e7 100%)"
      }}
    >
      <div className="mb-[34px] text-center">
        <p className="m-0 font-script text-[clamp(1.45rem,3vw,2.2rem)] tracking-[0.03em] text-gold-500">tentang kami</p>
        <h2 className="mt-1.5 font-brand text-[clamp(1.9rem,3.8vw,3rem)] tracking-[0.08em]">{about.title}</h2>
      </div>
      <p className="mx-auto w-[min(780px,100%)] text-[1.04rem] leading-[1.75] text-ink-700">{about.description}</p>
      <div className="mx-auto mt-[30px] grid w-[min(740px,100%)] grid-cols-3 gap-[14px] max-md:grid-cols-1">
        {about.highlights.map((item, index) => (
          (() => {
            const highlight = resolveHighlight(item, productCount);

            if (highlight.type === "shield") {
              return (
                <div
                  key={`${item.value}-${item.label}-${index}`}
                  className="grid place-items-center gap-2 rounded-full border border-[rgba(181,140,55,0.55)] bg-white/65 px-[10px] py-4"
                >
                  <Image src="/logo/shield.png" alt="Logo keamanan produk" width={52} height={52} className="h-[52px] w-[52px] object-contain" />
                  <span className="text-[0.92rem] font-bold text-ink-700">{highlight.label}</span>
                </div>
              );
            }

            if (highlight.type === "certification") {
              return (
                <div
                  key={`${item.value}-${item.label}-${index}`}
                  className="grid place-items-center gap-2 rounded-full border border-[rgba(181,140,55,0.55)] bg-white/65 px-[10px] py-4"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Image src="/logo/Bpom.png" alt="Logo BPOM" width={47} height={47} className="h-[47px] w-[47px] object-contain" />
                    <Image src="/logo/Halal.png" alt="Logo Halal" width={47} height={47} className="h-[47px] w-[47px] object-contain" />
                  </div>
                  <span className="text-[0.92rem] font-bold text-ink-700">{highlight.label}</span>
                </div>
              );
            }

            return (
              <div
                key={`${item.value}-${item.label}-${index}`}
                className="rounded-full border border-[rgba(181,140,55,0.55)] bg-white/65 px-[10px] py-4"
              >
                <strong className="block font-brand text-[1.45rem]">{highlight.value}</strong>
                <span
                  className={`text-[0.92rem] text-ink-700 ${highlight.label === "Produk Unggulan" ? "mt-3 inline-block font-bold" : ""}`}
                >
                  {highlight.label}
                </span>
              </div>
            );
          })()
        ))}
      </div>
    </section>
  );
}
