'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScrollPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="w-full bg-slate-950">
      {/* Section 1 - Dark */}
      <section className="relative h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '54px 54px'
            }}
          />
          {/* Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8">
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-tight">
            I Know What Exactly<br />you're Looking For!
          </h1>
          <p className="text-slate-400 text-xl mt-6">Scroll down to see more</p>
        </div>
      </section>

      {/* Section 2 - Light with rounded corners */}
      <section className="relative h-screen w-full bg-gray-200 flex items-center justify-center overflow-hidden rounded-tl-[60px] rounded-tr-[60px] shadow-[0_-20px_60px_rgba(0,0,0,0.3)]">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '54px 54px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8">
          <h1 className="text-slate-900 text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-tight">
            Here It Is!<br />Enjoy It!
          </h1>
          <p className="text-slate-500 text-xl mt-6">Keep scrolling</p>
        </div>
      </section>

      {/* Section 3 - Dark */}
      <section className="relative h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '54px 54px'
            }}
          />
          {/* Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-slate-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8">
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-tight">
            Thanks For Scrolling!<br />Now Scroll Up
          </h1>
          <p className="text-slate-400 text-xl mt-6">The smoothest scroll experience</p>
        </div>
      </section>
    </main>
  );
}
