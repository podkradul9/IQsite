import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, ChevronRight } from "lucide-react";

const navItems = [
  { label: "Тесты", action: "tests" },
  { label: "Тарифы", to: "/docs/tariffs", hasDropdown: true },
  { label: "Кабинет", to: "/dashboard" },
  { label: "Документы", to: "/docs/oferta", hasDropdown: true },
];

export default function Navbar({ onShowTests }) {
  return (
    <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10">
      <div className="flex-1 hidden md:block" />

      <ul className="hidden md:flex items-center gap-8 text-[rgb(45,45,45)] font-normal text-sm">
        {navItems.map((item) => {
          const inner = (
            <>
              {item.label}
              {item.hasDropdown && (
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </>
          );
          const cls = "cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group";
          return (
            <li key={item.label}>
              {item.to ? (
                <Link to={item.to} className={cls}>{inner}</Link>
              ) : (
                <button type="button" onClick={onShowTests} className={cls}>{inner}</button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="md:hidden">
        <span className="font-regular tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">TestLab</span>
      </div>

      <div className="flex-1 flex justify-end">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/test/iq-full"
            className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group"
          >
            <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-xs md:text-sm font-normal">Пройти тест</span>
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}
