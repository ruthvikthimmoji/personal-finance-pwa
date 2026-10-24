import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDisplayTimeMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDisplayTimeMs = 1400,
}) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Stage 1: Progress step to 65% quickly
    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 350);

    // Stage 2: Progress step to 90%
    const timer2 = setTimeout(() => {
      setProgress(92);
    }, 750);

    // Stage 3: Finish progress and begin exit transition
    const timer3 = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);
    }, minDisplayTimeMs);

    // Stage 4: Unmount after fade-out transition (450ms)
    const timer4 = setTimeout(() => {
      setIsMounted(false);
      onFinish?.();
    }, minDisplayTimeMs + 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [minDisplayTimeMs, onFinish]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-[#FAF8F5] select-none transition-all duration-500 ease-out safe-top safe-bottom ${
        isFadingOut ? 'opacity-0 scale-[1.04] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      {/* Ambient background glow behind the logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(26, 115, 232, 0.08) 0%, rgba(243, 239, 230, 0.6) 45%, rgba(250, 248, 245, 0) 70%)',
        }}
      />

      {/* Top spacer */}
      <div className="w-full flex items-center justify-between opacity-0">
        <span className="text-xs">Top</span>
      </div>

      {/* Center Hero: Luxury Floating Emblem + Typography */}
      <div className="relative flex flex-col items-center text-center animate-fade-in">
        {/* Floating Logo Card */}
        <div className="relative group">
          {/* Subtle outer accent ring */}
          <div className="absolute -inset-2 rounded-[34px] bg-gradient-to-b from-[#1A73E8]/15 via-transparent to-[#E8E3DA]/40 blur-[8px] opacity-70" />

          {/* Elevated Emblem */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-white border border-[#E8E3DA] shadow-2xl shadow-black/[0.06] flex items-center justify-center p-5 transform transition-transform duration-700 ease-out hover:scale-105">
            <img
              src="/logo-mark.png"
              alt="Personal Finance Logo"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[26px] font-bold tracking-tight text-[#111827] mt-7">
          Personal Finance
        </h1>

        {/* Tagline */}
        <p className="text-[11px] tracking-[0.22em] uppercase font-semibold text-[#5E6A75] mt-1.5">
          Private · Calm · Real-time
        </p>

        {/* Status Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#E8E3DA] text-[11px] text-[#5E6A75]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Local Vault · Instant Sync</span>
        </div>
      </div>

      {/* Bottom Footer: Minimalist Progress Bar + Privacy Assurance */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3 relative">
        {/* 3px Sleek Progress Bar */}
        <div className="w-44 h-[3px] bg-[#E8E3DA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A73E8] rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Lock / Security Label */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#8C9BA8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" strokeWidth={2} />
          <span>Encrypted on-device · Direct Google Sheet connection</span>
        </div>
      </div>
    </div>
  );
};
