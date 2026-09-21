import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestBySlug } from "../data/tests";

export default function TestPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const test = getTestBySlug(slug);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  if (!test) return <div className="min-h-screen bg-paper flex items-center justify-center text-ink-soft">Тест не найден</div>;

  const question = test.questions[step];
  const progress = Math.round((step / test.questions.length) * 100);

  function selectOption(i, score) {
    setSelected(i);
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelected(null);
      if (step + 1 < test.questions.length) {
        setStep(step + 1);
      } else {
        navigate(`/test/${slug}/result`, { state: { answers: newAnswers } });
      }
    }, 220);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <div className="h-1.5 bg-ink/10 rounded-full mb-10 overflow-hidden">
          <div className="h-full bg-marker transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mb-8 leading-snug">{question.text}</h2>

        <div className="space-y-3" role="radiogroup" aria-label={question.text}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={selected === i}
              onClick={() => selectOption(i, opt.score)}
              className={`w-full flex items-center gap-4 text-left px-5 py-4 rounded-2xl bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-marker ${
                selected === i ? "ring-2 ring-marker" : "hover:bg-ink/[0.03]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 shrink-0 transition ${
                  selected === i ? "border-marker bg-marker" : "border-ink/20"
                }`}
              />
              <span className="text-ink">{opt.text}</span>
            </button>
          ))}
        </div>

        <p className="text-ink-soft text-sm mt-6">
          Вопрос {step + 1} из {test.questions.length}
        </p>
      </div>
    </div>
  );
}
