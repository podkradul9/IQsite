import { Link } from "react-router-dom";
import { tests, reactionTest } from "../data/tests";

// Постеры тестов стоят в галерее на месте картинок из макета. Графика собрана
// из типографики и CSS в стилистике исходных работ (чёрный, белый, красный),
// так что внешних изображений не нужно. Каждый вариант описан в Home.css.
const posterArt = {
  "iq-full": {
    variant: "iq",
    art: (
      <>
        <span className="poster-iq__circle" />
        <span className="poster-iq__word">IQ</span>
        <span className="poster-iq__row">2 · 4 · 8 · 16 · ?</span>
      </>
    ),
  },
  "relationships-girls": {
    variant: "love",
    art: (
      <>
        <span className="poster-love__word">любовь</span>
        <span className="poster-love__heart">♥</span>
      </>
    ),
  },
  "relationships-guys": {
    variant: "pair",
    art: (
      <>
        <span className="poster-pair__ring poster-pair__ring--a" />
        <span className="poster-pair__ring poster-pair__ring--b" />
        <span className="poster-pair__word">пара</span>
      </>
    ),
  },
  "attractiveness-women": {
    variant: "charm",
    art: (
      <>
        <span className="poster-charm__bar" />
        <span className="poster-charm__word">шарм</span>
      </>
    ),
  },
  "attractiveness-men": {
    variant: "charisma",
    art: (
      <>
        <span className="poster-charisma__word">харизма</span>
        <span className="poster-charisma__dot" />
      </>
    ),
  },
  "reaction-speed": {
    variant: "reaction",
    art: (
      <>
        <span className="poster-reaction__circle">
          <span className="poster-reaction__ms">243</span>
          <span className="poster-reaction__unit">мс</span>
        </span>
      </>
    ),
  },
};

const allTests = [...tests, reactionTest];

export default function TestPoster({ slug, className = "" }) {
  const test = allTests.find((t) => t.slug === slug);
  const poster = posterArt[slug];
  if (!test || !poster) return null;

  return (
    <Link to={`/test/${test.slug}`} className={`poster poster--${poster.variant} ${className}`}>
      <div className="poster__art" aria-hidden="true">{poster.art}</div>
      <div className="poster__body">
        <span className="poster__category">{test.category}</span>
        <h3 className="poster__title">{test.title}</h3>
        <p className="poster__text">{test.description}</p>
        <span className="poster__cta">Пройти тест <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
