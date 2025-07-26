import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export function drawLandmarksOnCanvas(
  ctx: CanvasRenderingContext2D,
  result: FaceLandmarkerResult,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);

  if (result.faceLandmarks.length === 0) return;

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
  ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';

  // Por simplicidad: dibujamos puntos
  result.faceLandmarks[0].forEach((lm) => {
    const x = lm.x * width;
    const y = lm.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

export function hasFace(result: FaceLandmarkerResult) {
  return result.faceLandmarks && result.faceLandmarks.length > 0;
}
