import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { createClinic } from '../../api/clinics';
import type { ClinicDto, CreateClinicDto } from '../../types/clinic';
import PageWrapper from '../../components/PageWrapper';

const schema: yup.ObjectSchema<CreateClinicDto> = yup.object({
  name: yup.string().required('Requerido'),
  address: yup.string().optional(),
  latitude: yup.number().required('Latitud obligatoria'),
  longitude: yup.number().required('Longitud obligatoria'),
  email: yup.string().email('Formato inválido').optional(),
});

export default function CreateClinicPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClinicDto>({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: CreateClinicDto) => {
    await createClinic(data);
    navigate('/clinics');
  };

  return (
    <PageWrapper>
      {/* // <div className="max-w-xl mx-auto bg-white p-6 rounded shadow"> */}
      <div className="max-w-xl mx-auto bg-emerald-950/50 p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Nueva clínica</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <Input
            label="Nombre"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input label="Dirección" {...register('address')} />
          <Input
            label="Latitud"
            type="number"
            step="0.000001"
            {...register('latitude')}
            error={errors.latitude?.message}
          />
          <Input
            label="Longitud"
            type="number"
            step="0.000001"
            {...register('longitude')}
            error={errors.longitude?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <button disabled={isSubmitting} className="btn btn-primary mt-4">
            {isSubmitting ? 'Guardando…' : 'Crear'}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}

/* input genérico */
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
