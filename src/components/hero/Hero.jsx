import { motion } from "motion/react";
import Navbar from "./Navbar";
import HeroBadge from "./HeroBadge";
import BottomLeftCard from "./BottomLeftCard";
import BottomRightCorner from "./BottomRightCorner";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4";

export default function Hero({ onShowTests }) {
  return (
    <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">
      <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/10 group">
        {/* Подложка на время загрузки видео (или если его заблокировали) */}
        <div className="hero-fallback absolute inset-0 z-0" aria-hidden="true" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
          src={HERO_VIDEO}
        />

        <div className="relative z-10 w-full h-full flex flex-col items-center">
          <Navbar onShowTests={onShowTests} />

          <div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">
            <HeroBadge />
            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#5E6470] mb-2 tracking-tight leading-[1.05]"
            >
              Узнай себя за пять минут
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-[#5E6470] opacity-80 leading-relaxed max-w-xl font-normal"
            >
              Тесты на IQ, скорость реакции, отношения и привлекательность с подробным разбором результата.
            </motion.p>
          </div>

          <BottomLeftCard onShowTests={onShowTests} />
          <BottomRightCorner />
        </div>
      </section>
    </div>
  );
}
