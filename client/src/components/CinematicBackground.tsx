import React from "react";

export function CinematicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Projected Light Beams */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] cinematic-beam-bg" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] cinematic-beam-bg" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[140px] cinematic-beam-bg" style={{ animationDelay: "-8s" }} />
      
      {/* Floating Star Dust Particles */}
      <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-cyan-300 rounded-full blur-[1px] particle" style={{ animationDuration: "6s" }} />
      <div className="absolute top-2/3 left-3/4 w-3 h-3 bg-purple-300 rounded-full blur-[1px] particle" style={{ animationDuration: "9s", animationDelay: "-2s" }} />
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px] particle" style={{ animationDuration: "7s", animationDelay: "-4s" }} />
      <div className="absolute top-1/6 left-4/5 w-2.5 h-2.5 bg-cyan-200 rounded-full blur-[1px] particle" style={{ animationDuration: "11s", animationDelay: "-1s" }} />
      <div className="absolute bottom-1/5 left-1/6 w-2 h-2 bg-pink-400 rounded-full blur-[1px] particle" style={{ animationDuration: "8s", animationDelay: "-3s" }} />
    </div>
  );
}
