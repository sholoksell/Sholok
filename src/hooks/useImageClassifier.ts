import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { modelLoading, modelReady, modelError, modelReset } from "@/store/slices/imageClassifierSlice";

// Module-level singleton — survives re-renders, shared across all SearchBar instances.
// The model object is not serializable so it lives outside Redux.
let _model: any = null;
let _loadPromise: Promise<void> | null = null;

async function loadModel(dispatch: ReturnType<typeof useAppDispatch>) {
  if (_model) return _model;
  if (!_loadPromise) {
    dispatch(modelLoading());
    _loadPromise = (async () => {
      try {
        // Dynamic imports → code-split, only downloaded when user uses image search
        const [tf, mobilenet] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/mobilenet"),
        ]);
        await (tf as any).ready();
        // version 2, alpha 1.0 = best accuracy; cached in browser IndexedDB after first load
        _model = await (mobilenet as any).load({ version: 2, alpha: 1.0 });
        dispatch(modelReady());
      } catch {
        _loadPromise = null; // allow retry
        dispatch(modelError());
        throw new Error("Failed to load image recognition model");
      }
    })();
  }
  await _loadPromise;
  return _model;
}

/** Convert a File to an HTMLImageElement via object URL. */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
    img.src = url;
  });
}

/**
 * Hook that provides client-side image classification via MobileNet (TensorFlow.js).
 * No external API — model runs entirely in the browser and is cached after first load.
 */
export function useImageClassifier() {
  const dispatch   = useAppDispatch();
  const modelStatus = useAppSelector((s) => s.imageClassifier.status);

  const classify = useCallback(async (file: File): Promise<string> => {
    const model = await loadModel(dispatch);
    const img   = await fileToImage(file);

    // topK = 5 candidates; MobileNet labels look like "laptop, laptop computer"
    const predictions: Array<{ className: string; probability: number }> =
      await model.classify(img, 5);

    // Take top 2 predictions, extract the first keyword from each label
    const keywords = predictions
      .slice(0, 2)
      .map((p) => p.className.split(",")[0].trim())
      .filter(Boolean)
      .join(" ");

    return keywords;
  }, [dispatch]);

  const resetModel = useCallback(() => {
    _model = null;
    _loadPromise = null;
    dispatch(modelReset());
  }, [dispatch]);

  return { classify, modelStatus, resetModel };
}
