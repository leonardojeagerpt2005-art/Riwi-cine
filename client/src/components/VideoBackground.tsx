import React from "react";

/**
 * Cinematic video background shared by Login and Register.
 * Kept intentionally light: one <video>, one dark overlay gradient,
 * and a handful of transform/opacity-only particles so it never
 * touches layout or forces extra paints while the liquid-glass
 * panels blur on top of it.
 */
export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://res.cloudinary.com/lnyl9lwv/video/upload/v1787315361/rwnjzio97m5yje2ur5nb.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      {/* Dark overlay so the form stays readable, like a title card over a trailer */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

      {/* Subtle drifting dust over the footage — transform/opacity only, cheap to animate */}
      <div
        className="absolute top-1/4 left-[15%] w-2 h-2 bg-cyan-300 rounded-full blur-[1px] particle"
        style={{ animationDuration: "9s" }}
      />
      <div
        className="absolute top-2/3 left-3/4 w-2.5 h-2.5 bg-purple-300 rounded-full blur-[1px] particle"
        style={{ animationDuration: "11s", animationDelay: "-3s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full blur-[1px] particle"
        style={{ animationDuration: "8s", animationDelay: "-5s" }}
      />
    </div>
  );
}
