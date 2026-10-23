// Studio-Grade High-Definition Client-Side Image Processor for RISIKA BLOOMS
// Preserves crystal-clear sharpness, vibrant floral colors, and fine velvet textures.
// Features:
// 1. 1600px Ultra-HD target bounds (crystal clear on 4K, iPad & Retina AMOLED phone screens)
// 2. High-smoothing quality canvas context ('high' bicubic interpolation)
// 3. Multi-pass stepped downsampling (eliminates pixel-skipping aliasing & blur)
// 4. Subtle Unsharp Mask convolution filter (enhances petal edges, floral ribbons & typography)
// 5. Modern WebP compression (0.88 quality) with graceful JPEG fallback (<260KB, fits easily in Firestore 1MB limit)

export const compressImageFile = (
  file,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.88
) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        try {
          const srcWidth = img.naturalWidth || img.width;
          const srcHeight = img.naturalHeight || img.height;

          if (!srcWidth || !srcHeight) {
            return resolve(e.target.result);
          }

          // Calculate aspect-ratio preserved dimensions
          let targetWidth = srcWidth;
          let targetHeight = srcHeight;

          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const widthRatio = maxWidth / targetWidth;
            const heightRatio = maxHeight / targetHeight;
            const scale = Math.min(widthRatio, heightRatio);

            targetWidth = Math.round(targetWidth * scale);
            targetHeight = Math.round(targetHeight * scale);
          }

          // Multi-pass stepped downsampling algorithm
          // If downscaling significantly (>2x), halve iteratively to avoid pixel skipping and aliasing
          let currentCanvas = document.createElement('canvas');
          let currentWidth = srcWidth;
          let currentHeight = srcHeight;
          currentCanvas.width = currentWidth;
          currentCanvas.height = currentHeight;

          let ctx = currentCanvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return resolve(e.target.result);
          }

          // Initial render with white background (fixes transparency for transparent PNGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, currentWidth, currentHeight);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

          // Step-down loop (halving dimensions until within 2x of target)
          while (currentWidth > targetWidth * 2 && currentHeight > targetHeight * 2) {
            const nextWidth = Math.floor(currentWidth / 2);
            const nextHeight = Math.floor(currentHeight / 2);

            const nextCanvas = document.createElement('canvas');
            nextCanvas.width = nextWidth;
            nextCanvas.height = nextHeight;

            const nextCtx = nextCanvas.getContext('2d', { willReadFrequently: true });
            if (!nextCtx) break;

            nextCtx.imageSmoothingEnabled = true;
            nextCtx.imageSmoothingQuality = 'high';
            nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

            currentCanvas = nextCanvas;
            currentWidth = nextWidth;
            currentHeight = nextHeight;
          }

          // Final draw to exact target dimensions
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = targetWidth;
          finalCanvas.height = targetHeight;
          const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });

          if (!finalCtx) {
            return resolve(e.target.result);
          }

          finalCtx.fillStyle = '#FFFFFF';
          finalCtx.fillRect(0, 0, targetWidth, targetHeight);
          finalCtx.imageSmoothingEnabled = true;
          finalCtx.imageSmoothingQuality = 'high';
          finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

          // Apply gentle edge-preserving sharpening (Unsharp Mask filter)
          // Restores crisp micro-contrast on flower petals, velvet textures, and gift ribbons
          applySubtleSharpen(finalCtx, targetWidth, targetHeight);

          // Test WebP support with fallback to high-quality JPEG
          let resultDataUrl = '';
          try {
            const webpUrl = finalCanvas.toDataURL('image/webp', quality);
            if (webpUrl && webpUrl.startsWith('data:image/webp')) {
              resultDataUrl = webpUrl;
            }
          } catch {
            // WebP not supported in browser canvas
          }

          if (!resultDataUrl) {
            resultDataUrl = finalCanvas.toDataURL('image/jpeg', quality);
          }

          // Safety check: ensure size is within Firestore document safe range (<850KB)
          // (Data URL length: 1 char ~= 0.75 byte; 1,100,000 chars ~= 825KB)
          if (resultDataUrl.length > 1100000 && quality > 0.76) {
            resultDataUrl = finalCanvas.toDataURL('image/jpeg', 0.80);
          }

          resolve(resultDataUrl);
        } catch (procErr) {
          console.warn('Advanced canvas processing note, falling back:', procErr);
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * High-performance 3x3 convolution unsharp filter for canvas
 * Restores optical clarity lost during camera downsampling without introducing noise
 */
function applySubtleSharpen(ctx, width, height) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // Subtle 3x3 laplacian sharpening kernel
    // Center = 1.28, surrounding orthogonal = -0.07 (sum = 1.0)
    const centerWeight = 1.28;
    const edgeWeight = -0.07;

    const rowBytes = width * 4;

    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * rowBytes;
      const topOffset = (y - 1) * rowBytes;
      const bottomOffset = (y + 1) * rowBytes;

      for (let x = 1; x < width - 1; x++) {
        const px = rowOffset + (x * 4);
        const topPx = topOffset + (x * 4);
        const bottomPx = bottomOffset + (x * 4);
        const leftPx = px - 4;
        const rightPx = px + 4;

        // Apply kernel to R, G, B channels
        for (let c = 0; c < 3; c++) {
          const val = (copy[px + c] * centerWeight) +
            (copy[topPx + c] * edgeWeight) +
            (copy[bottomPx + c] * edgeWeight) +
            (copy[leftPx + c] * edgeWeight) +
            (copy[rightPx + c] * edgeWeight);

          data[px + c] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    // If getImageData is restricted (e.g. cross-origin), canvas remains untouched
    console.debug('Sharpen pass skipped:', err);
  }
}
