// src/utils/canvas.ts
export function syncCanvasToMedia(
  videoEl: HTMLVideoElement,
  canvasEl: HTMLCanvasElement,
) {
  const dpr = window.devicePixelRatio || 1;

  // Dimensión real que se está mostrando en pantalla
  const rect = videoEl.getBoundingClientRect();
  const displayWidth = rect.width;
  const displayHeight = rect.height;

  // Set CSS size (lo visual)
  canvasEl.style.width = `${displayWidth}px`;
  canvasEl.style.height = `${displayHeight}px`;

  // Set backing store size (lo que dibuja el contexto)
  canvasEl.width = Math.floor(displayWidth * dpr);
  canvasEl.height = Math.floor(displayHeight * dpr);

  const ctx = canvasEl.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

/** Observa cambios de tamaño del <video> (por responsive/layout) */
export function observeVideoResize(
  videoEl: HTMLVideoElement,
  canvasEl: HTMLCanvasElement,
) {
  const ro = new ResizeObserver(() => {
    syncCanvasToMedia(videoEl, canvasEl);
  });
  ro.observe(videoEl);
  return () => ro.disconnect();
}
``;
