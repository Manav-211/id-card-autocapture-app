export function getImageDataFromVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): ImageData | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function grayFromImageData(img: ImageData): { gray: Uint8Array; width: number; height: number } {
  const { width, height, data } = img;
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return { gray, width, height };
}

export function sobelMagnitude(gray: Uint8Array, width: number, height: number): Uint8Array {
  const mag = new Uint8Array(width * height);
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const idx = (y + ky) * width + (x + kx);
        const kernelIdx = (ky + 1) * 3 + (kx + 1);
      gx += gray[idx] * kernelX[kernelIdx];
        gy += gray[idx] * kernelY[kernelIdx];
        }
      }
      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      mag[y * width + x] = magnitude;
    }
  }
  return mag;
}

export function sharpnessMetric(gray: Uint8Array, width: number, height: number): number {
  let total = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
      const lap =
         -gray[idx - width - 1] - gray[idx - width] - gray[idx - width + 1] -
        gray[idx - 1] + 8 * gray[idx] - gray[idx + 1] -
        gray[idx + width - 1] - gray[idx + width] - gray[idx + width + 1];
         total += lap * lap;
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

export function edgeAreaPercent(mag: Uint8Array, width: number, height: number, threshold: number): number {
  let edgePixels = 0;
  for (let i = 0; i < mag.length; i++) {
  if (mag[i] > threshold) edgePixels++;
  }
  return (edgePixels / mag.length) * 100;
}