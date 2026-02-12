export default function AboutSection({ about }) {
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
          <div
            key={`${item.value}-${item.label}-${index}`}
            className="rounded-full border border-[rgba(181,140,55,0.55)] bg-white/65 px-[10px] py-4"
          >
            <strong className="block font-brand text-[1.45rem]">{item.value}</strong>
            <span className="text-[0.92rem] text-ink-700">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
