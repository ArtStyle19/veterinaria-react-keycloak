// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { useNavigate } from 'react-router-dom';
// import { registerVet } from '../../api/vets';
// import { getAllClinics } from '../../api/clinics';
// import type { ClinicDto } from '../../types/clinic';
// import type { RegisterVetRequest } from '../../types/vet';
// import PageWrapper from '../../components/PageWrapper';

// const schema: yup.ObjectSchema<RegisterVetRequest> = yup.object({
//   username: yup.string().required('Requerido'),
//   password: yup.string().min(6, 'Mínimo 6 caracteres').required(),
//   clinicId: yup.number().required('Elige clínica'),
//   celNum: yup.string().optional(),
//   email: yup.string().email('Formato inválido').optional(),
// });

// export default function RegisterVetPage() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterVetRequest>({ resolver: yupResolver(schema) });

//   const [clinics, setClinics] = useState<ClinicDto[]>([]);
//   const [loadingClinics, setLoadingClinics] = useState(true);
//   const navigate = useNavigate();

//   /* cargamos clínicas para el <select> */
//   useEffect(() => {
//     getAllClinics()
//       .then(setClinics)
//       .finally(() => setLoadingClinics(false));
//   }, []);

//   const onSubmit = async (data: RegisterVetRequest) => {
//     await registerVet(data);
//     navigate('/clinics'); // page futura (opcional) o a donde prefieras
//   };

//   return (
//     <PageWrapper>
//       <div className="max-w-xl mx-auto bg-white/0 p-6 rounded shadow">
//         <h1 className="text-xl font-semibold mb-4">
//           Registrar nuevo veterinario
//         </h1>

//         <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
//           <Input
//             label="Usuario"
//             {...register('username')}
//             error={errors.username?.message}
//           />
//           <Input
//             label="Contraseña"
//             type="password"
//             {...register('password')}
//             error={errors.password?.message}
//           />

//           {/* Select de clínica */}
//           <div>
//             <label className="block text-sm mb-1">Clínica</label>
//             {loadingClinics ? (
//               <p>Cargando clínicas…</p>
//             ) : (
//               <select className="select w-full" {...register('clinicId')}>
//                 <option value="">— Elegir —</option>
//                 {clinics.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//             {errors.clinicId && (
//               <p className="text-red-500 text-xs">{errors.clinicId.message}</p>
//             )}
//           </div>

//           <Input label="Celular" {...register('celNum')} />
//           <Input
//             label="Email"
//             type="email"
//             {...register('email')}
//             error={errors.email?.message}
//           />

//           <button disabled={isSubmitting} className="btn btn-primary mt-4">
//             {isSubmitting ? 'Registrando…' : 'Registrar'}
//           </button>
//         </form>
//       </div>
//     </PageWrapper>
//   );
// }

// /* reutilizable */
// type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
//   error?: string;
// };
// function Input({ label, error, ...rest }: InputProps) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input {...rest} className="input w-full" />
//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// }

// src/pages/RegisterVetPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { getAllClinics } from '../../api/clinics';
import { registerVetWithFace } from '../../api/vets';
import type { ClinicDto } from '../../types/clinic';
import type { RegisterVetWithFaceRequest } from '../../types/vet';
import PageWrapper from '../../components/PageWrapper';

/* ------------------------- Validación ------------------------- */
const schema: yup.ObjectSchema<RegisterVetWithFaceRequest> = yup.object({
  username: yup.string().required('Requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required(),
  email: yup.string().email('Formato inválido').required(),
  firstname: yup.string().required('Requerido'),
  lastname: yup.string().required('Requerido'),
  celNum: yup.string().optional(),
  clinicId: yup.string().required('Elige clínica'),
  faceBase64: yup.string().required('Captura requerida'),
});

/* -------------------------- Página --------------------------- */
export default function RegisterVetPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterVetWithFaceRequest>({ resolver: yupResolver(schema) });

  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const navigate = useNavigate();
  const faceBase64 = watch('faceBase64');

  // refs para cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streaming, setStreaming] = useState(false);

  /* --------- Cargar clínicas --------- */
  useEffect(() => {
    getAllClinics()
      .then(setClinics)
      .finally(() => setLoadingClinics(false));
  }, []);

  /* --------- Limpieza al desmontar --------- */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* --------- Submit --------- */
  const onSubmit = async (data: RegisterVetWithFaceRequest) => {
    await registerVetWithFace(data);
    navigate('/clinics');
  };

  /* --------- Upload manual --------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const fullBase64 = reader.result?.toString();
      setValue('faceBase64', fullBase64 || '');
    };
    reader.readAsDataURL(file);
  };

  /* --------- Cámara --------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // 'environment' para trasera en móviles
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS/Safari puede requerir play() manual y muted
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      console.error('Error al activar cámara:', err);
      alert(
        'No se pudo acceder a la cámara. Verifica permisos del navegador (HTTPS, permisos, etc).',
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.warn('Video aún no está listo para capturar');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');
    setValue('faceBase64', dataURL);
  };

  /* -------------------------- Render -------------------------- */
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Registrar nuevo veterinario
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <Input
            label="Usuario"
            {...register('username')}
            error={errors.username?.message}
          />
          <Input
            label="Contraseña"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Nombre"
            {...register('firstname')}
            error={errors.firstname?.message}
          />
          <Input
            label="Apellido"
            {...register('lastname')}
            error={errors.lastname?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Celular"
            {...register('celNum')}
            error={errors.celNum?.message}
          />

          {/* Clínica */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Clínica
            </label>
            {loadingClinics ? (
              <p>Cargando clínicas…</p>
            ) : (
              <select
                className="select w-full border px-3 py-2 rounded"
                {...register('clinicId')}
              >
                <option value="">— Elegir —</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {errors.clinicId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.clinicId.message}
              </p>
            )}
          </div>

          {/* Foto facial */}
          <div className="grid gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Foto facial (JPEG/PNG)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="input w-full border p-2 rounded"
            />

            <div className="flex items-center gap-2">
              {!streaming ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn btn-outline btn-sm"
                >
                  Activar cámara
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-outline btn-sm"
                >
                  Apagar cámara
                </button>
              )}

              <button
                type="button"
                onClick={takePhoto}
                className="btn btn-secondary btn-sm"
                disabled={!streaming}
                title={!streaming ? 'Primero activa la cámara' : ''}
              >
                Tomar foto
              </button>
            </div>

            {/* Renderizamos SIEMPRE el video para que el ref exista */}
            <video
              ref={videoRef}
              width={320}
              height={240}
              autoPlay
              playsInline
              muted
              className={`mt-2 rounded border max-w-full ${!streaming ? 'hidden' : ''}`}
            />

            {faceBase64 && (
              <img
                src={faceBase64}
                alt="Preview"
                className="mt-4 h-32 w-auto object-contain border rounded shadow"
              />
            )}

            {errors.faceBase64 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.faceBase64.message}
              </p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            className="btn btn-primary mt-4 w-full py-2"
          >
            {isSubmitting ? 'Registrando…' : 'Registrar veterinario'}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}

/* ---------------------- Input wrapper ------------------------ */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};
function Input({ label, error, ...rest }: InputProps) {
  return (
    <div>
      <label className="block text-sm mb-1 font-medium text-gray-700">
        {label}
      </label>
      <input {...rest} className="input w-full border px-3 py-2 rounded" />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
