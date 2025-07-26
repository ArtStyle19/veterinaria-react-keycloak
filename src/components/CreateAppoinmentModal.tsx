// src/components/CreateAppointmentModal.tsx

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createAppointment, getSymptoms } from '../api/medical';
import { predict } from '../api/predictions';
import type { CreateAppointmentRequest } from '../types/medical';
import toast from 'react-hot-toast';

// Validación
const schema: yup.ObjectSchema<CreateAppointmentRequest> = yup.object({
  date: yup.string().optional(),
  weight: yup
    .number()
    .typeError('Debe ser un número')
    .positive('Debe ser un número positivo')
    .required('Requerido'),
  temperature: yup.number().typeError('Debe ser un número').required(),
  heartRate: yup.number().typeError('Debe ser un número').optional(),
  description: yup.string().optional(),
  treatments: yup.string().optional(),
  diagnosis: yup.string().optional(),
  notes: yup.string().optional(),
  symptoms: yup.array(yup.string().required()).optional(),
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recordId: number;
  onSuccess?: () => void;
};

type Option = { value: string; label: string };

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  recordId,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAppointmentRequest>({
    resolver: yupResolver(schema),
  });

  const [options, setOptions] = useState<Option[]>([]);
  const [symInput, setSymInput] = useState('');
  const [prediction, setPrediction] = useState<{
    disease: string;
    precautions: string[];
  }>();

  useEffect(() => {
    if (isOpen) {
      getSymptoms().then((syms) =>
        setOptions(syms.map((s) => ({ value: s, label: s }))),
      );
      reset(); // limpiar formulario al abrir
    }
  }, [isOpen]);

  const addSymptom = () => {
    if (!symInput.trim()) return;
    const values = options.map((o) => o.value);
    if (!values.includes(symInput))
      setOptions((prev) => [...prev, { value: symInput, label: symInput }]);
    const current = watch('symptoms') ?? [];
    setValue('symptoms', [...current, symInput]);
    setSymInput('');
  };

  const handlePredict = async () => {
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
      if (!watch('diagnosis')) setValue('diagnosis', res.disease);
    } catch {
      toast.error('No se pudo obtener la predicción');
    }
  };

  const onSubmit = async (data: CreateAppointmentRequest) => {
    const body = { date: new Date().toISOString(), ...data };
    await createAppointment(recordId, body);
    toast.success('Cita creada correctamente');
    onClose();
    onSuccess?.();
  };

  return (
    <Dialog as="div" className="relative z-50" onClose={onClose} open={isOpen}>
      <Transition appear show={isOpen} as={Fragment}>
        {/* Fondo */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Contenedor del modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto max-h-[90vh]">
                {/* <Dialog.Panel className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden p-6 space-y-5"> */}
                <Dialog.Title className="text-xl font-semibold">
                  Nueva cita
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                  {/* Entradas */}
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
                    label="Ritmo cardíaco"
                    type="number"
                    {...register('heartRate')}
                    error={errors.heartRate?.message}
                  />

                  {/* Síntomas */}
                  <div>
                    <label className="block text-sm mb-1">Síntomas</label>
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

                    <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border p-2 rounded bg-white/5">
                      {options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex gap-1 items-center text-xs"
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

                    <button
                      type="button"
                      onClick={handlePredict}
                      className="btn btn-secondary w-full mt-3"
                    >
                      Predecir enfermedad
                    </button>
                  </div>

                  {prediction && (
                    <div className="mt-4 p-4 rounded-xl border border-emerald-400/20 bg-emerald-900/30 backdrop-blur">
                      <h3 className="text-lg font-semibold text-emerald-200 mb-2">
                        Enfermedad probable: {prediction.disease}
                      </h3>
                      <ul className="list-disc pl-5 text-sm">
                        {prediction.precautions.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Textarea label="Descripción" {...register('description')} />
                  <Textarea label="Diagnóstico" {...register('diagnosis')} />
                  <Textarea label="Tratamientos" {...register('treatments')} />
                  <Textarea label="Notas" {...register('notes')} />

                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      type="submit"
                    >
                      {isSubmitting ? 'Guardando…' : 'Crear cita'}
                    </button>
                  </div>
                </form>{' '}
              </div>{' '}
              {/* ← este cierre antes del Transition.Child */}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Transition>
    </Dialog>
  );
}

/* Helpers */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: any;
};
function Input({ label, error, ...rest }: InputProps) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
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
      <label className="block text-sm mb-1">{props.label}</label>
      <textarea {...props} className="input w-full h-24 resize-y" />
    </div>
  );
}
