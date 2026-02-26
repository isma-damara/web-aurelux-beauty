"use client";

import { useEffect, useRef } from "react";

export default function PromoVideoSection({ hero }) {
  const promoVideoUrl = hero?.promoVideoUrl;
  const posterImage = hero?.posterImage;
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const hasStartedRef = useRef(false);
  const isLockedRef = useRef(false);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    const videoNode = videoRef.current;

    if (!sectionNode || !videoNode || !promoVideoUrl) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (isLockedRef.current || hasStartedRef.current) {
            return;
          }
          videoNode.muted = true;
          const playPromise = videoNode.play();
          hasStartedRef.current = true;
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
          return;
        }

        if (hasStartedRef.current && !videoNode.ended) {
          videoNode.pause();
          isLockedRef.current = true;
        }
      },
      { threshold: 0.55 },
    );

    const onEnded = () => {
      isLockedRef.current = true;
    };

    videoNode.addEventListener("ended", onEnded);

    observer.observe(sectionNode);

    return () => {
      observer.disconnect();
      videoNode.removeEventListener("ended", onEnded);
      videoNode.pause();
    };
  }, [promoVideoUrl]);

  if (!promoVideoUrl) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="reveal mt-16 px-[min(6vw,70px)] pb-10 pt-10 max-md:mt-12 max-md:px-[18px] max-md:pb-7 max-md:pt-7"
    >
      <div className="mx-auto w-[min(1140px,100%)]">
        <div className="mb-3.5 text-center">
          <p className="m-0 font-script text-[clamp(1.45rem,3vw,2.2rem)] tracking-[0.03em] text-gold-500">
            Brand Campaign
          </p>
        </div>

        <div className="relative isolate">
          <div className="pointer-events-none absolute -inset-[2px] rounded-[17px] bg-[linear-gradient(120deg,rgba(255,255,255,0.9),rgba(239,224,181,0.95),rgba(255,255,255,0.9))] opacity-95" />
          <div className="relative overflow-hidden rounded-[14px] border border-white/95 bg-black ring-1 ring-black/10 shadow-[0_24px_48px_rgba(17,20,24,0.26)]">
            <video
              ref={videoRef}
              className="block aspect-video w-full object-cover"
              muted
              defaultMuted
              playsInline
              preload="metadata"
              poster={posterImage || undefined}
            >
              <source src={promoVideoUrl} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/70 bg-black/38 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white max-md:left-3 max-md:top-3">
              Official Video
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
