export default function ContactSection({ contact, defaultWhatsAppLink }) {
  return (
    <section
      id="kontak"
      className="reveal px-6 py-[82px] text-center max-md:px-5"
      style={{ background: "linear-gradient(180deg, #efe2b7 0%, #eddca7 100%)" }}
    >
      <h2 className="font-brand text-[clamp(2rem,4vw,3.1rem)]">{contact.headline}</h2>
      <p className="mb-6 mt-3 text-ink-700">{contact.description}</p>
      <a
        className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-transparent bg-[linear-gradient(100deg,#1f7a3f,#239149)] px-6 text-[0.92rem] font-semibold text-white shadow-[0_8px_18px_rgba(35,145,73,0.3)] transition duration-200 hover:-translate-y-px animate-pulse-slow"
        href={defaultWhatsAppLink}
      >
        Hubungi via WhatsApp
      </a>
      <div className="mt-[22px] flex flex-wrap justify-center gap-x-[18px] gap-y-2 text-[0.93rem] text-ink-700 max-md:flex-col">
        <span>{contact.address}</span>
        <span>{contact.email}</span>
        <span>
          {contact.phone} {contact.pic ? `(PIC: ${contact.pic})` : ""}
        </span>
      </div>
    </section>
  );
}
