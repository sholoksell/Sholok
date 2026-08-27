import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { modelLoading, modelReady, modelError, modelReset } from "@/store/slices/imageClassifierSlice";


// ─── MobileNet singleton (fallback) ───────────────────────────────────────────
let _model: any = null;
let _loadPromise: Promise<void> | null = null;

async function loadMobileNet(dispatch: ReturnType<typeof useAppDispatch>) {
  if (_model) return _model;
  if (!_loadPromise) {
    dispatch(modelLoading());
    _loadPromise = (async () => {
      try {
        const [tf, mobilenet] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/mobilenet"),
        ]);
        await (tf as any).ready();
        _model = await (mobilenet as any).load({ version: 2, alpha: 1.0 });
        dispatch(modelReady());
      } catch {
        _loadPromise = null;
        dispatch(modelError());
        throw new Error("Failed to load MobileNet");
      }
    })();
  }
  await _loadPromise;
  return _model;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read file as base64 (no prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Convert file to HTMLImageElement via object URL (for MobileNet). */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Cannot load image")); };
    img.src = url;
  });
}

// ─── MobileNet + label map ────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string[]> = {
  // Fruits
  strawberry: ["strawberry", "fruit"], pineapple: ["pineapple", "fruit"],
  ananas: ["pineapple", "fruit"], banana: ["banana", "fruit"],
  apple: ["apple", "fruit"], orange: ["orange", "fruit"],
  mango: ["mango", "fruit"], grape: ["grape", "fruit"],
  blueberry: ["blueberry", "fruit"], watermelon: ["watermelon", "fruit"],
  peach: ["peach", "fruit"], fig: ["fig", "fruit"],
  pomegranate: ["pomegranate", "fruit"], lemon: ["lemon", "fruit"],
  lime: ["lime", "fruit"], coconut: ["coconut", "fruit"],
  guava: ["guava", "fruit"], jackfruit: ["jackfruit", "fruit"],
  papaya: ["papaya", "fruit"], cherry: ["cherry", "fruit"],
  kiwi: ["kiwi", "fruit"], melon: ["melon", "fruit"],
  plum: ["plum", "fruit"], raspberry: ["raspberry", "fruit"],
  avocado: ["avocado", "fruit"], lychee: ["lychee", "fruit"],
  "custard apple": ["custard apple", "fruit"],
  // Vegetables
  broccoli: ["broccoli", "vegetable"], carrot: ["carrot", "vegetable"],
  tomato: ["tomato", "vegetable"], potato: ["potato", "vegetable"],
  onion: ["onion", "vegetable"], spinach: ["spinach", "vegetable"],
  garlic: ["garlic", "vegetable"], ginger: ["ginger", "vegetable"],
  cabbage: ["cabbage", "vegetable"], cauliflower: ["cauliflower", "vegetable"],
  mushroom: ["mushroom", "vegetable"], cucumber: ["cucumber", "vegetable"],
  eggplant: ["eggplant", "vegetable"], pumpkin: ["pumpkin", "vegetable"],
  pepper: ["pepper", "vegetable"],
  // Meat/Fish
  chicken: ["chicken", "meat"], fish: ["fish", "seafood"],
  shrimp: ["shrimp", "seafood"], prawn: ["prawn", "seafood"],
  beef: ["beef", "meat"], mutton: ["mutton", "meat"], egg: ["egg"],
  // Grocery
  rice: ["rice"], bread: ["bread"], milk: ["milk", "dairy"],
  butter: ["butter", "dairy"], honey: ["honey"], sugar: ["sugar"],
  // Electronics
  laptop: ["laptop", "computer"], "laptop computer": ["laptop", "computer"],
  computer: ["computer", "laptop"], keyboard: ["keyboard"], mouse: ["mouse"],
  monitor: ["monitor", "display"], television: ["television", "TV"],
  phone: ["phone", "mobile"], mobile: ["mobile", "phone"],
  smartphone: ["smartphone", "mobile"], tablet: ["tablet"],
  camera: ["camera"], headphones: ["headphones", "earphone"],
  earphone: ["earphone", "headphones"], speaker: ["speaker"], charger: ["charger"],
  fan: ["fan"], refrigerator: ["refrigerator", "fridge"],
  "washing machine": ["washing machine"], iron: ["iron"], blender: ["blender"],
  // Clothing
  shirt: ["shirt", "clothing"], jersey: ["jersey", "shirt"],
  "t-shirt": ["t-shirt", "shirt"], "tee shirt": ["t-shirt", "shirt"],
  dress: ["dress", "clothing"], jeans: ["jeans", "pants"],
  pants: ["pants", "trouser"], jacket: ["jacket", "clothing"],
  hoodie: ["hoodie", "sweater"], sweater: ["sweater", "clothing"],
  shoe: ["shoe", "footwear"], sneaker: ["sneaker", "shoe"],
  "running shoe": ["shoe", "sneaker"], sandal: ["sandal", "footwear"],
  slipper: ["slipper", "footwear"], boot: ["boot", "footwear"],
  bag: ["bag"], handbag: ["handbag", "bag"], backpack: ["backpack", "bag"],
  wallet: ["wallet"], watch: ["watch"], glasses: ["glasses", "sunglasses"],
  hat: ["hat"], cap: ["cap", "hat"], belt: ["belt"],
  // Beauty
  lipstick: ["lipstick", "cosmetic"], cream: ["cream", "cosmetic"],
  lotion: ["lotion", "cosmetic"], perfume: ["perfume"],
  shampoo: ["shampoo"], soap: ["soap"],
  // Home
  chair: ["chair", "furniture"], table: ["table", "furniture"],
  sofa: ["sofa", "furniture"], lamp: ["lamp"], pillow: ["pillow"],
  curtain: ["curtain"], carpet: ["carpet"], clock: ["clock"],
  // Sports
  football: ["football", "sports"], "soccer ball": ["football", "sports"],
  basketball: ["basketball", "sports"], cricket: ["cricket", "sports"],
  bicycle: ["bicycle", "sports"], dumbbell: ["dumbbell", "gym"],
  // Books/Stationery
  book: ["book"], pen: ["pen", "stationery"], pencil: ["pencil", "stationery"],
  // Toys
  "teddy bear": ["teddy bear", "toy"], doll: ["doll", "toy"],
};

function buildFallbackQuery(preds: Array<{ className: string; probability: number }>): string {
  // Count how many predictions map to each category (last item in LABEL_MAP arrays)
  const categoryCounts: Record<string, number> = {};
  for (const pred of preds) {
    const parts = pred.className.toLowerCase().split(",").map((p) => p.trim());
    for (const part of parts) {
      const mapResult = LABEL_MAP[part];
      if (mapResult) {
        const cat = mapResult[mapResult.length - 1];
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        continue;
      }
      for (const w of part.split(/\s+/)) {
        const wResult = LABEL_MAP[w];
        if (wResult) {
          const cat = wResult[wResult.length - 1];
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
      }
    }
  }
  const entries = Object.entries(categoryCounts);
  if (entries.length > 0) {
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0]; // Return only the top-voted category (e.g. "fruit", "shoe", "mobile")
  }
  // No label map match — return first word of top prediction
  return preds[0].className.toLowerCase().split(",")[0].trim().split(/\s+/)[0];
}

async function analyzeWithMobileNet(
  file: File,
  dispatch: ReturnType<typeof useAppDispatch>,
): Promise<string> {
  const model = await loadMobileNet(dispatch);
  const img   = await fileToImage(file);
  const preds: Array<{ className: string; probability: number }> =
    await model.classify(img, 5);
  return buildFallbackQuery(preds);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useImageClassifier() {
  const dispatch    = useAppDispatch();
  const modelStatus = useAppSelector((s) => s.imageClassifier.status);

  const classify = useCallback(async (file: File): Promise<string> => {
    return analyzeWithMobileNet(file, dispatch);
  }, [dispatch]);

  const resetModel = useCallback(() => {
    _model = null;
    _loadPromise = null;
    dispatch(modelReset());
  }, [dispatch]);

  return { classify, modelStatus, resetModel };
}
