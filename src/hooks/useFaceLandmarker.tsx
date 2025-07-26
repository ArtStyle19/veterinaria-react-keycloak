import { useEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

type Options = {
  maxFaces?: number;
  runningMode?: 'IMAGE' | 'VIDEO';
};

export function useFaceLandmarker(opts: Options = {}) {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const base = await FilesetResolver.forVisionTasks(
        // CDN de MediaPipe (puedes hostear tú mismo si quieres)
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
      );

      if (cancelled) return;

      landmarkerRef.current = await FaceLandmarker.createFromOptions(base, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        },
        outputFaceBlendshapes: false,
        runningMode: opts.runningMode ?? 'IMAGE',
        numFaces: opts.maxFaces ?? 1,
      });

      if (!cancelled) setReady(true);
    };

    init();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [opts.maxFaces, opts.runningMode]);

  return {
    ready,
    landmarker: landmarkerRef.current,
    DrawingUtils,
  };
}
