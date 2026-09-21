import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reactionTest } from "../data/tests";

export default function ReactionTest() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro"); // intro | waiting | go | early | roundResult | finished
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [lastMs, setLastMs] = useState(null);

  const timeoutRef = useRef(null);
  const roundTimeoutRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(roundTimeoutRef.current);
    };
  }, []);

  function scheduleGo() {
    setPhase("waiting");
    const delay = 1500 + Math.random() * 2500; // 1.5–4с непредсказуемая пауза
    timeoutRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
    }, delay);
  }

  function handleBoxClick() {
    if (phase === "intro") {
      scheduleGo();
      return;
    }
    if (phase === "waiting") {
      clearTimeout(timeoutRef.current);
      setPhase("early");
      return;
    }
    if (phase === "early") {
      scheduleGo();
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - startRef.current);
      const newTimes = [...times, ms];
      setTimes(newTimes);
      setLastMs(ms);
      setPhase("roundResult");

      roundTimeoutRef.current = setTimeout(() => {
        if (newTimes.length >= reactionTest.rounds) {
          const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
          navigate(`/test/${reactionTest.slug}/result`, { state: { avgMs: avg, times: newTimes } });
        } else {
          setRound((r) => r + 1);
          scheduleGo();
        }
      }, 900);
    }
  }

  const boxStyles = {
    intro: "bg-white text-ink-soft",
    waiting: "bg-amber-200 text-amber-900",
    go: "bg-emerald-400 text-white",
    early: "bg-rose-300 text-rose-900",
    roundResult: "bg-white text-ink-soft",
  };

  const boxText = {
    intro: "Нажмите, чтобы начать",
    waiting: "Ждите...",
    go: "Жмите!",
    early: "Рано! Нажмите, чтобы попробовать снова",
    roundResult: `${lastMs} мс`,
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4">
          <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Раунд {Math.min(round + 1, reactionTest.rounds)} из {reactionTest.rounds}
          </span>
        </div>

        <button
          onClick={handleBoxClick}
          className={`w-full h-72 rounded-3xl flex items-center justify-center text-2xl font-bold font-display transition-colors duration-150 shadow-sm select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2 ${boxStyles[phase]}`}
        >
          <span aria-live="polite">{boxText[phase]}</span>
        </button>

        <p className="text-center text-ink-soft text-sm mt-5">
          Дождитесь, пока фон станет зелёным, и нажимайте как можно быстрее. Если нажмёте раньше — раунд начнётся заново.
        </p>
      </div>
    </div>
  );
}
