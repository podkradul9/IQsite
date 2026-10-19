import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import TestPoster from "../components/TestPoster";
import heroImg from "../assets/hero-face.webp";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Порядок постеров повторяет раскладку галереи из макета: левая колонка едет
// медленнее скролла, правая — быстрее, за счёт этого и получается "плавающий" параллакс.
const leftColumn = ["iq-full", "relationships-girls", "text:about", "attractiveness-women"];
const rightColumn = ["text:how", "reaction-speed", "attractiveness-men", "relationships-guys"];

const textBlocks = {
  about: {
    title: "Узнайте о себе больше за пять минут",
    text: "Логика, скорость реакции, отношения и самоподача. Каждый тест заканчивается подробным разбором, а не общими фразами на все случаи жизни.",
  },
  how: {
    title: "Отвечаете — и сразу видите итог",
    text: "Полный разбор результата доступен по подписке: 10 ₽ за первые 3 дня, далее 100 ₽ каждые 30 дней. Отменить можно в любой момент, даже без входа в аккаунт.",
  },
};

function GalleryItem({ id }) {
  if (id.startsWith("text:")) {
    const block = textBlocks[id.slice(5)];
    return (
      <div className="text-block gallery__item">
        <h2 className="text-block__h">{block.title}</h2>
        <p className="text-block__p">{block.text}</p>
      </div>
    );
  }
  return <TestPoster slug={id} className="gallery__item" />;
}

export default function Home() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    // Как в исходном макете: на тач-устройствах плавный скролл не включаем —
    // там нативная инерция и так плавная, а перехват прокрутки только мешает.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (ScrollTrigger.isTouch === 1 || reduceMotion) return;

    const ctx = gsap.context(() => {
      ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.5,
        effects: true,
      });

      gsap.fromTo(".hero-section", { opacity: 1 }, {
        opacity: 0,
        scrollTrigger: { trigger: ".hero-section", start: "center", end: "820", scrub: true },
      });

      gsap.utils.toArray(".gallery__left .gallery__item").forEach((item) => {
        gsap.fromTo(item, { opacity: 0, x: -50 }, {
          opacity: 1,
          x: 0,
          scrollTrigger: { trigger: item, start: "-850", end: "-100", scrub: true },
        });
      });

      gsap.utils.toArray(".gallery__right .gallery__item").forEach((item) => {
        gsap.fromTo(item, { opacity: 0, x: 50 }, {
          opacity: 1,
          x: 0,
          scrollTrigger: { trigger: item, start: "-750", end: "top", scrub: true },
        });
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <nav className="top-nav">
        <Link to="/" className="top-nav__logo">TestLab</Link>
        <div className="top-nav__links">
          <Link to="/dashboard">Кабинет</Link>
          <Link to="/login" className="top-nav__cta">Войти</Link>
        </div>
      </nav>

      <div className="wrapper" ref={wrapperRef}>
        <div className="content" ref={contentRef}>
          <header className="hero-section">
            <img data-speed=".6" className="hero" src={heroImg} alt="" aria-hidden="true" />
            <div className="page-container">
              <div data-speed=".75" className="main-header">
                <h1 className="main-title">узнай себя</h1>
                <p className="main-subtitle">
                  Тесты на IQ, скорость реакции, отношения и привлекательность
                  <span aria-hidden="true"> ↓</span>
                </p>
              </div>
            </div>
          </header>

          <div className="portfolio">
            <div className="page-container">
              <main className="gallery">
                <div data-speed=".9" className="gallery__left">
                  {leftColumn.map((id) => <GalleryItem key={id} id={id} />)}
                </div>
                <div data-speed="1.1" className="gallery__right">
                  {rightColumn.map((id) => <GalleryItem key={id} id={id} />)}
                </div>
              </main>
            </div>
          </div>

          <footer className="site-footer">
            <span className="site-footer__logo">TestLab</span>
            <div className="site-footer__links">
              <Link to="/docs/oferta">Публичная оферта</Link>
              <Link to="/docs/privacy">Политика конфиденциальности</Link>
              <Link to="/docs/agreement">Пользовательское соглашение</Link>
              <Link to="/docs/tariffs">Тарифы</Link>
              <Link to="/docs/consent">Согласие на обработку данных</Link>
              <Link to="/unsubscribe">Отменить подписку</Link>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
