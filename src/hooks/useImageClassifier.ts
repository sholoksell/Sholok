import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { modelLoading, modelReady, modelError, modelReset } from "@/store/slices/imageClassifierSlice";

// ─── Gemini config ─────────────────────────────────────────────────────────────
// Add VITE_GEMINI_API_KEY to your local .env file (gitignored — never committed).
// Get a free key at: https://aistudio.google.com/app/apikey
// Restrict the key to sholok.com referrer in Google Cloud Console.
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
// Auth keys (AQ. prefix) require x-goog-api-key header, not ?key= query param
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`;

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

// ─── PRIMARY: Gemini Vision ────────────────────────────────────────────────────

const GEMINI_PROMPT = `You are a product search assistant for an e-commerce website.
Look at the image and identify what product or item is shown.
Return ONLY a short product search term (1-4 words in English) that matches how it would be listed in an e-commerce product database.
Use the most direct, simple product name — no adjectives, no extra words.
Examples:
- Mixed fruit bowl → fruit
- Running shoes → shoe
- Laptop computer → laptop
- Red dress → dress
- Raw fish → fish
- Chicken pieces → chicken
- Onion → onion
- Tomato → tomato
- Smartphone → mobile phone
Respond with ONLY the search term. No explanation. No punctuation. English only.`;

async function analyzeWithGemini(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const mime   = file.type || "image/jpeg";

  const res = await fetch(GEMINI_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mime, data: base64 } },
          { text: GEMINI_PROMPT },
        ],
      }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.1 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const json = await res.json();
  const text = (json.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim().toLowerCase();
  // Strip any accidental quotes or periods
  return text.replace(/["'.]/g, "").trim();
}

// ─── FALLBACK: MobileNet + label map ─────────────────────────────────────────

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
  const seen  = new Set<string>();
  const terms: string[] = [];
  const add = (t: string) => {
    const k = t.toLowerCase();
    if (!seen.has(k) && k.length > 1) { seen.add(k); terms.push(k); }
  };
  for (const pred of preds) {
    const parts = pred.className.toLowerCase().split(",").map((p) => p.trim());
    for (const part of parts) {
      if (LABEL_MAP[part]) { LABEL_MAP[part].forEach(add); continue; }
      const words = part.split(/\s+/);
      let hit = false;
      for (const w of words) { if (LABEL_MAP[w]) { LABEL_MAP[w].forEach(add); hit = true; } }
      if (!hit) words.filter((w) => w.length > 2).forEach(add);
    }
  }
  return terms.slice(0, 5).join(" ");
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
    // 1. Try Gemini (best accuracy, free online AI)
    if (GEMINI_KEY) {
      try {
        const result = await analyzeWithGemini(file);
        if (result) return result;
      } catch {
        // Gemini failed → fall through to MobileNet
      }
    }

    // 2. Fallback: MobileNet + label map (runs offline in browser)
    return analyzeWithMobileNet(file, dispatch);
  }, [dispatch]);

  const resetModel = useCallback(() => {
    _model = null;
    _loadPromise = null;
    dispatch(modelReset());
  }, [dispatch]);

  return { classify, modelStatus, resetModel };
}
