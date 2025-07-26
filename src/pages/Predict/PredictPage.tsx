// src/pages/Predict/PredictPage.tsx
import { useEffect, useState } from 'react';
import { getSymptoms } from '../../api/medical';
import { predict } from '../../api/predictions';

export default function PredictPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<{
    disease: string;
    precautions: string[];
  }>();

  useEffect(() => {
    getSymptoms().then(setSymptoms);
  }, []);

  const toggle = (s: string) =>
    setSelected((sel) =>
      sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s],
    );

  async function handlePredict() {
    if (selected.length === 0) return;
    const r = await predict({ symptoms: selected });
    setResult({
      disease: r.disease,
      precautions: Object.values(r.precautions),
    });
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-8 space-y-6 text-black">
      <h1 className="text-2xl font-bold">Predictor de Enfermedades</h1>

      {/* Lista de síntomas */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-white/5 p-4 rounded-xl">
        {symptoms.map((s) => (
          <label key={s} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(s)}
              onChange={() => toggle(s)}
            />
            {s}
          </label>
        ))}
      </div>

      <button
        onClick={handlePredict}
        disabled={selected.length === 0}
        className="btn btn-primary w-full"
      >
        Predecir
      </button>

      {/* Resultado */}
      {result && (
        <div className="bg-emerald-900/40 border border-emerald-400/20 p-6 rounded-xl backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-2 text-emerald-200">
            Enfermedad probable: {result.disease}
          </h2>
          <h3 className="text-lg mb-1">Precauciones sugeridas:</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            {result.precautions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
