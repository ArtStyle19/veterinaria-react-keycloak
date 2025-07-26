import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { createAppointment, getSymptoms } from '../../api/medical';
import { predict } from '../../api/predictions'; // 👈
import type { CreateAppointmentRequest } from '../../types/medical';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';

// THIS IS THE KEY PART
const schema: yup.ObjectSchema<CreateAppointmentRequest> = yup.object({
  date: yup.string().optional(),
  weight: yup
    .number()
    .typeError('Debe ser un número')
    .positive('Debe ser un número positivo')
    .required('Requerido'),
  temperature: yup
    .number()
    .typeError('Debe ser un número')
    .required('Requerido'),
  heartRate: yup.number().typeError('Debe ser un número').optional(),
  description: yup.string().optional(),
  treatments: yup.string().optional(),
  diagnosis: yup.string().optional(),
  notes: yup.string().optional(),
  // symptoms: yup.array().of(yup.string()).optional(),
  symptoms: yup.array(yup.string().required()).optional(),
});

type Option = { value: string; label: string };

export default function CreateAppointmentPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  /* react-hook-form */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAppointmentRequest>({
    resolver: yupResolver(schema),
  });

  /* síntomas disponibles / seleccionados */
  const [options, setOptions] = useState<Option[]>([]);
  const [symInput, setSymInput] = useState('');

  /* predicción */
  const [prediction, setPrediction] = useState<{
    disease: string;
    precautions: string[];
  }>();

  /* cargar lista de síntomas al montar */
  useEffect(() => {
    getSymptoms().then((syms) =>
      setOptions(syms.map((s) => ({ value: s, label: s }))),
    );
  }, []);

  /* quick-add */
  function addSymptom() {
    if (!symInput.trim()) return;
    const already = options.map((o) => o.value);
    if (!already.includes(symInput))
      setOptions((prev) => [...prev, { value: symInput, label: symInput }]);

    /** añadirlo como tildado */
    const current = watch('symptoms') ?? [];
    setValue('symptoms', [...current, symInput]);
    setSymInput('');
  }

  /* === 1)  PREDICCIÓN  ====================================== */
  async function handlePredict() {
    const syms = watch('symptoms') ?? [];
    if (syms.length === 0) {
      toast.error('Selecciona al menos un síntoma');
      return;
    }
    try {
      const res = await predict({ symptoms: syms });
      setPrediction({
        disease: res.disease,
        precautions: Object.values(res.precautions),
      });
      // Rellenar diagnóstico automáticamente si vacío
      const currentDiag = watch('diagnosis');
      if (!currentDiag) setValue('diagnosis', res.disease);
    } catch (err) {
      toast.error('No se pudo obtener la predicción');
    }
  }

  /* === 2)  CREAR CITA  ====================================== */
  const onSubmit = async (data: CreateAppointmentRequest) => {
    if (!recordId) return;
    const body = { date: new Date().toISOString(), ...data };
    await createAppointment(Number(recordId), body);
    navigate(-1);
  };

  /* ========== UI ============================================ */
  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto bg-white/5 p-6 rounded-2xl shadow-xl backdrop-blur">
        <h1 className="text-xl font-semibold mb-5 text-white">Nueva cita</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {/* datos físicos */}
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            {...register('weight')}
            error={errors.weight?.message}
          />
          <Input
            label="Temperatura (°C)"
            type="number"
            step="0.1"
            {...register('temperature')}
            error={errors.temperature?.message}
          />
          <Input
            label="Ritmo cardíaco (lpm)"
            type="number"
            {...register('heartRate')}
            error={errors.heartRate?.message}
          />

          {/* síntomas */}
          <div>
            <label className="block text-sm mb-1 text-white">Síntomas</label>

            <div className="flex gap-2 mb-2">
              <input
                value={symInput}
                onChange={(e) => setSymInput(e.target.value)}
                className="input flex-1"
                placeholder="Escribe y pulsa +"
              />
              <button
                type="button"
                onClick={addSymptom}
                className="btn btn-primary"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border p-2 rounded bg-white/5">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex gap-1 items-center text-xs text-white"
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    {...register('symptoms')}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* botón de predicción */}
            <button
              type="button"
              onClick={handlePredict}
              className="btn btn-secondary w-full mt-3"
            >
              Predecir enfermedad
            </button>
          </div>

          {/* tarjeta de resultado */}
          {prediction && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-400/20 bg-emerald-900/30 backdrop-blur">
              <h3 className="text-lg font-semibold text-emerald-200 mb-2">
                Enfermedad probable: {prediction.disease}
              </h3>
              <h4 className="text-sm mb-1 text-white/80">
                Precauciones sugeridas:
              </h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {prediction.precautions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* descripción y demás */}
          <Textarea label="Descripción" {...register('description')} />
          <Textarea label="Diagnóstico" {...register('diagnosis')} />
          <Textarea label="Tratamientos" {...register('treatments')} />
          <Textarea label="Notas" {...register('notes')} />

          <button disabled={isSubmitting} className="btn btn-primary mt-2">
            {isSubmitting ? 'Guardando…' : 'Crear cita'}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}

/* === helpers =================================================== */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: any;
};
function Input({ label, error, ...rest }: InputProps) {
  return (
    <div>
      <label className="block text-sm mb-1 text-white">{label}</label>
      <input {...rest} className="input w-full" />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  return (
    <div>
      <label className="block text-sm mb-1 text-white">{props.label}</label>
      <textarea {...props} className="input w-full h-24 resize-y" />
    </div>
  );
}
