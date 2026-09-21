import { useParams, Link } from "react-router-dom";
import { legalDocs } from "../data/legalDocs";

export default function LegalDoc() {
  const { docKey } = useParams();
  const doc = legalDocs[docKey];

  if (!doc) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Документ не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-8">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 mb-6">
          Это шаблон документа для старта проекта, а не готовый юридический текст. Перед
          публикацией сайта замените поля в квадратных скобках на реальные реквизиты и
          проверьте документ с юристом.
        </div>

        <h1 className="font-display text-2xl font-bold text-ink mb-1">{doc.title}</h1>
        <p className="text-xs text-ink-soft mb-6">Обновлено: {doc.updated}</p>

        <div className="space-y-5">
          {doc.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-semibold text-ink mb-1.5">{s.heading}</h2>
              <p className="text-sm text-ink-soft whitespace-pre-line leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <Link to="/" className="inline-block mt-8 text-sm text-marker hover:text-marker-dark rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
