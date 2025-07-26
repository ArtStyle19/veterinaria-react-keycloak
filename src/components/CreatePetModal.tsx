import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import type { PetCreation } from '../types/pet';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import React from 'react';

type Props = { isOpen: boolean; onClose: () => void };

const schema: yup.ObjectSchema<PetCreation> = yup.object({
  name: yup.string().required(),
  species: yup.string().required(),
  breed: yup.string().optional(),
  sex: yup
    .mixed<'MALE' | 'FEMALE' | 'UNKNOWN'>()
    .oneOf(['MALE', 'FEMALE', 'UNKNOWN'])
    .required(),
  status: yup
    .mixed<'OK' | 'LOST' | 'SICK' | 'DECEASED'>()
    .oneOf(['OK', 'LOST', 'SICK', 'DECEASED'])
    .required(),
  birthdate: yup.date().required(),
  clinic: yup.number().optional(),
  ownerName: yup.string().optional(),
  ownerContact: yup.string().optional(),
  ownerEmail: yup.string().email().optional(),
  visibility: yup.mixed<'PUBLIC' | 'PRIVATE' | 'PUBLIC_ONLY'>().optional(),
});

export default function CreatePetModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const isVet = user?.roleName === 'VET';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetCreation>({ resolver: yupResolver(schema) });

  async function onSubmit(data: PetCreation) {
    const url = isVet ? '/api/pets/with-history' : '/api/pets';
    const payload = isVet
      ? { ...data, birthdate: data.birthdate || null }
      : { ...data, birthdate: data.birthdate || null };

    try {
      await api.post(url, payload);
      toast.success('Mascota registrada');
      reset();
      onClose();
    } catch (err) {
      toast.error('Error al registrar');
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            className="fixed inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm z-40"
            // className="fixed inset-0 bg-black/0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal */}
            {/* Modal: evita que los clics dentro del modal cierren el modal */}
            <motion.div
              className="bg-black/60 border border-white/10 shadow-glass    rounded-2xl p-6 w-1/3 text-slate-100 flex flex-col"
              // className="bg-gray-900 text-white justify-center items-center rounded-xl p-6 shadow-xl border border-white/10"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()} // prevenir cierre si hace click dentro

              // Este onClick no debería ir aquí: el motion.div no debe bloquear
            >
              <h2 className="text-xl font-bold mb-4">
                {isVet ? 'Registrar paciente' : 'Registrar nueva mascota'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <Input
                  label="Nombre"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Input
                  label="Especie"
                  {...register('species')}
                  error={errors.species?.message}
                />
                <Input label="Raza" {...register('breed')} />

                <Label>Sexo</Label>
                <select className="select w-full" {...register('sex')}>
                  <option value="MALE">Macho</option>
                  <option value="FEMALE">Hembra</option>
                  <option value="UNKNOWN">Desconocido</option>
                </select>

                <Label>Estado</Label>
                <select className="select w-full" {...register('status')}>
                  <option value="OK">OK</option>
                  <option value="LOST">PERDIDO</option>
                  <option value="SICK">ENFERMO</option>
                  <option value="DECEASED">FALLECIDO</option>
                </select>

                <Input
                  label="Nacimiento"
                  type="date"
                  {...register('birthdate')}
                />

                {isVet && (
                  <>
                    <Input
                      label="Nombre del dueño"
                      {...register('ownerName')}
                    />
                    <Input
                      label="Contacto del dueño"
                      {...register('ownerContact')}
                    />
                  </>
                )}

                {!isVet && (
                  <Input
                    label="ID Clínica (opcional)"
                    type="number"
                    {...register('clinic')}
                  />
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Helpers */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm">{children}</label>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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
