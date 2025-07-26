import { Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type SubmitHandler,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { getAllClinics } from '../api/clinics';
import { registerVetWithFace } from '../api/vets';
import type { ClinicDto } from '../types/clinic';
import type { RegisterVetWithFaceRequest } from '../types/vet';

import { useFaceLandmarker } from '../hooks/useFaceLandmarker';
import { drawLandmarksOnCanvas, hasFace } from '../utils/faceUtils';
import { syncCanvasToMedia, observeVideoResize } from '../utils/canvas';

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

/* ------------------------- Props ------------------------------ */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function RegisterVetModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  /* ------------------ Form / defaults ------------------ */
  const INITIAL_VALUES = useMemo<RegisterVetWithFaceRequest>(
    () => ({
      username: '',
      password: '',
      email: '',
      firstname: '',
      lastname: '',
      celNum: '',
      clinicId: '',
      faceBase64: '',
    }),
    [],
  );

  const methods = useForm<RegisterVetWithFaceRequest>({
    resolver: yupResolver(schema),
    defaultValues: INITIAL_VALUES,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    reset,
  } = methods;

  const faceBase64 = watch('faceBase64');

  /* ------------------ UI state ------------------ */
  const [step, setStep] = useState<1 | 2>(1);
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [captureMode, setCaptureMode] = useState<'file' | 'camera'>('file');

  /* ------------------ Camera refs/state ------------------ */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasVideoRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number>();
  const resizeObsCleanupRef = useRef<(() => void) | null>(null);
  const lastDetectTsRef = useRef(0);

  const [streaming, setStreaming] = useState(false);

  /* ------------------ Face validation ------------------ */
  const [faceValid, setFaceValid] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string>('');

  /* ------------------ MediaPipe ------------------ */
  const { ready, landmarker } = useFaceLandmarker({
    maxFaces: 1,
    runningMode: 'IMAGE',
  });

  /* ------------------ Helpers ------------------ */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    setStreaming(false);

    if (canvasVideoRef.current) {
      const ctx = canvasVideoRef.current.getContext('2d');
      if (ctx)
        ctx.clearRect(
          0,
          0,
          canvasVideoRef.current.width,
          canvasVideoRef.current.height,
        );
    }

    if (resizeObsCleanupRef.current) {
      resizeObsCleanupRef.current();
      resizeObsCleanupRef.current = null;
    }
  };

  const resetModalState = () => {
    stopCamera();
    cancelAnimationFrame(rafIdRef.current || 0);
    setStep(1);
    setCaptureMode('file');
    setFaceValid(false);
    setFaceError(null);
    setProcessedPreview('');
    reset(INITIAL_VALUES, { keepErrors: false, keepDirty: false });
  };

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    if (isOpen) {
      resetModalState();
      setLoadingClinics(true);
      getAllClinics()
        .then(setClinics)
        .finally(() => setLoadingClinics(false));
    } else {
      resetModalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
      cancelAnimationFrame(rafIdRef.current || 0);
    };
  }, []);

  /* ------------------ Camera logic ------------------ */
  const startCamera = async () => {
    if (!ready || !landmarker) {
      alert('Cargando modelo de rostro, intenta en un momento…');
      return;
    }
    try {
      await landmarker.setOptions({ runningMode: 'VIDEO' });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);

        if (canvasVideoRef.current) {
          syncCanvasToMedia(videoRef.current, canvasVideoRef.current);
          resizeObsCleanupRef.current = observeVideoResize(
            videoRef.current,
            canvasVideoRef.current,
          );
        }
      }

      startVideoLoop();
    } catch (err) {
      console.error('Error al activar cámara:', err);
      alert('No se pudo acceder a la cámara (HTTPS/permisos).');
    }
  };

  const startVideoLoop = () => {
    const loop = () => {
      if (!videoRef.current || !canvasVideoRef.current || !landmarker) return;

      const video = videoRef.current;
      const canvas = canvasVideoRef.current;

      if (video.readyState >= 2) {
        const nowInMs = performance.now();
        // throttle ~80ms
        if (nowInMs - lastDetectTsRef.current < 80) {
          rafIdRef.current = requestAnimationFrame(loop);
          return;
        }
        lastDetectTsRef.current = nowInMs;

        const result = landmarker.detectForVideo(video, nowInMs);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (hasFace(result)) {
            setFaceValid(true);
            setFaceError(null);
            drawLandmarksOnCanvas(ctx, result, canvas.width, canvas.height);
          } else {
            setFaceValid(false);
            setFaceError('No se detectó rostro.');
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx2 = canvas.getContext('2d');
    if (!ctx2) return;
    ctx2.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');

    stopCamera();
    cancelAnimationFrame(rafIdRef.current || 0);

    if (ready && landmarker) {
      await landmarker.setOptions({ runningMode: 'IMAGE' });

      const img = new Image();
      img.src = dataURL;
      await img.decode();

      const result = landmarker.detect(img);
      if (!hasFace(result)) {
        setFaceValid(false);
        setFaceError('No se detectó rostro en la foto tomada.');
        setValue('faceBase64', dataURL);
        setProcessedPreview('');
        return;
      }

      const canvasOut = document.createElement('canvas');
      canvasOut.width = img.width;
      canvasOut.height = img.height;
      const outCtx = canvasOut.getContext('2d');
      if (outCtx) {
        outCtx.drawImage(img, 0, 0);
        drawLandmarksOnCanvas(outCtx, result, img.width, img.height);
      }
      const processedURL = canvasOut.toDataURL('image/jpeg');

      setProcessedPreview(processedURL);
      setValue('faceBase64', dataURL);
      setFaceValid(true);
      setFaceError(null);
    } else {
      setValue('faceBase64', dataURL);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const fullBase64 = reader.result?.toString() || '';
      setValue('faceBase64', fullBase64);

      if (!ready || !landmarker) {
        setProcessedPreview('');
        setFaceValid(true);
        return;
      }

      await landmarker.setOptions({ runningMode: 'IMAGE' });

      const img = new Image();
      img.src = fullBase64;
      await img.decode();

      const result = landmarker.detect(img);

      if (!hasFace(result)) {
        setFaceValid(false);
        setFaceError('No se detectó rostro en la imagen cargada.');
        setProcessedPreview('');
        return;
      }

      const canvasOut = document.createElement('canvas');
      canvasOut.width = img.width;
      canvasOut.height = img.height;
      const outCtx = canvasOut.getContext('2d');
      if (outCtx) {
        outCtx.drawImage(img, 0, 0);
        drawLandmarksOnCanvas(outCtx, result, img.width, img.height);
      }
      setProcessedPreview(canvasOut.toDataURL('image/jpeg'));
      setFaceValid(true);
      setFaceError(null);
    };
    reader.readAsDataURL(file);
  };

  const recapture = async () => {
    setProcessedPreview('');
    setValue('faceBase64', '');
    setFaceValid(false);
    setFaceError(null);
    setCaptureMode('camera');
    await startCamera();
  };

  /* ------------------ Wizard nav & submit ------------------ */
  const goNext = async () => {
    const valid = await trigger([
      'username',
      'password',
      'email',
      'firstname',
      'lastname',
      'celNum',
      'clinicId',
    ]);
    if (valid) setStep(2);
  };

  const goBack = () => setStep(1);

  const onSubmit: SubmitHandler<RegisterVetWithFaceRequest> = async (data) => {
    if (!faceValid) {
      setFaceError('Necesitas una imagen con rostro válido.');
      return;
    }
    await registerVetWithFace(data);
    onSuccess?.();
    onClose();
  };

  /* ------------------ Render ------------------ */
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          stopCamera();
          onClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 -translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 -translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold mb-4">
                  Registrar nuevo veterinario
                </Dialog.Title>

                <Stepper current={step} />

                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-6 mt-4"
                  >
                    {step === 1 && (
                      <StepOne
                        loadingClinics={loadingClinics}
                        clinics={clinics}
                        register={register}
                        errors={errors}
                      />
                    )}

                    {step === 2 && (
                      <StepTwo
                        captureMode={captureMode}
                        setCaptureMode={(m) => {
                          if (m === 'file') stopCamera();
                          setCaptureMode(m);
                        }}
                        faceBase64={faceBase64}
                        errors={errors}
                        handleFile={handleFile}
                        startCamera={startCamera}
                        stopCamera={stopCamera}
                        takePhoto={takePhoto}
                        streaming={streaming}
                        videoRef={videoRef}
                        canvasVideoRef={canvasVideoRef}
                        processedPreview={processedPreview}
                        faceError={faceError}
                        ready={ready}
                        recapture={recapture}
                      />
                    )}

                    <div className="flex justify-between mt-2">
                      {step === 2 ? (
                        <button
                          type="button"
                          onClick={goBack}
                          className="btn btn-ghost"
                        >
                          ← Atrás
                        </button>
                      ) : (
                        <span />
                      )}

                      {step === 1 ? (
                        <button
                          type="button"
                          onClick={goNext}
                          className="btn btn-primary"
                        >
                          Siguiente →
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting || !faceValid}
                        >
                          {isSubmitting ? 'Registrando…' : 'Registrar'}
                        </button>
                      )}
                    </div>
                  </form>
                </FormProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

/* ------------------- Componentes de pasos ------------------- */

type StepOneProps = {
  loadingClinics: boolean;
  clinics: ClinicDto[];
  register: UseFormReturn<RegisterVetWithFaceRequest>['register'];
  errors: any;
};

function StepOne({ loadingClinics, clinics, register, errors }: StepOneProps) {
  return (
    <div className="grid gap-4">
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
          <p className="text-red-500 text-xs mt-1">{errors.clinicId.message}</p>
        )}
      </div>
    </div>
  );
}

type StepTwoProps = {
  captureMode: 'file' | 'camera';
  setCaptureMode: (m: 'file' | 'camera') => void;
  faceBase64: string | undefined;
  errors: any;
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => void;
  streaming: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasVideoRef: React.RefObject<HTMLCanvasElement>;
  processedPreview: string;
  faceError: string | null;
  ready: boolean;
  recapture: () => Promise<void>;
};

function StepTwo({
  captureMode,
  setCaptureMode,
  faceBase64,
  errors,
  handleFile,
  startCamera,
  stopCamera,
  takePhoto,
  streaming,
  videoRef,
  canvasVideoRef,
  processedPreview,
  faceError,
  ready,
  recapture,
}: StepTwoProps) {
  return (
    <div className="grid gap-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto facial
      </label>

      {/* selector modo */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`px-3 py-1.5 rounded border ${
            captureMode === 'file' ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
          onClick={() => {
            stopCamera();
            setCaptureMode('file');
          }}
        >
          Por archivo
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded border ${
            captureMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
          onClick={async () => {
            setCaptureMode('camera');
            await startCamera();
          }}
          disabled={!ready}
          title={!ready ? 'Cargando modelo…' : ''}
        >
          Por cámara
        </button>
      </div>

      {/* Contenido por modo */}
      {captureMode === 'file' && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="input w-full border p-2 rounded"
        />
      )}

      {captureMode === 'camera' && (
        <div className="grid gap-2 relative">
          <div className="flex items-center gap-2">
            {!streaming ? (
              <button
                type="button"
                onClick={startCamera}
                className="btn btn-outline btn-sm"
                disabled={!ready}
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
              disabled={!streaming}
              className="btn btn-secondary btn-sm"
              title={!streaming ? 'Primero activa la cámara' : ''}
            >
              Tomar foto
            </button>
          </div>

          {/* Video + Canvas overlay */}
          <div className={`relative mt-2 ${!streaming ? 'hidden' : 'block'}`}>
            <video
              ref={videoRef}
              width={320}
              height={240}
              autoPlay
              playsInline
              muted
              className="rounded border max-w-full"
            />
            <canvas
              ref={canvasVideoRef}
              className="absolute top-0 left-0 rounded pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Preview lado a lado con flecha */}
      {faceBase64 && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img
              src={faceBase64}
              alt="Preview original"
              className="h-32 w-auto object-contain border rounded shadow"
            />
            <span className="text-2xl">➡️</span>
            {processedPreview ? (
              <img
                src={processedPreview}
                alt="Preview con landmarks"
                className="h-32 w-auto object-contain border rounded shadow"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-500 border rounded w-40">
                Sin landmarks
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={recapture}
              className="btn btn-ghost btn-xs underline"
            >
              Repetir captura
            </button>
          </div>
        </div>
      )}

      {errors.faceBase64 && (
        <p className="text-red-500 text-xs mt-1">{errors.faceBase64.message}</p>
      )}
      {faceError && <p className="text-red-500 text-xs mt-1">{faceError}</p>}
    </div>
  );
}

/* ---------------------- Inputs & UI ------------------------- */
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

function Stepper({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-4 text-sm select-none">
      <div className="flex items-center gap-2">
        <Circle number={1} active={current >= 1} />
        <span className={current === 1 ? 'font-semibold' : ''}>Datos</span>
      </div>
      <span className="opacity-40">—</span>
      <div className="flex items-center gap-2">
        <Circle number={2} active={current >= 2} />
        <span className={current === 2 ? 'font-semibold' : ''}>
          Foto facial
        </span>
      </div>
    </div>
  );
}

function Circle({ number, active }: { number: number; active: boolean }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                  ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
    >
      {number}
    </div>
  );
}
