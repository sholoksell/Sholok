import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { modelLoading, modelReady, modelError, modelReset } from "@/store/slices/imageClassifierSlice";

// ─── Module-level singleton ────────────────────────────────────────────────────
// Model is not serializable → lives outside Redux; shared across all instances.
let _model: any = null;
let _loadPromise: Promise<void> | null = null;

async function loadModel(dispatch: ReturnType<typeof useAppDispatch>) {
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
        throw new Error("Failed to load image recognition model");
      }
    })();
  }
  await _loadPromise;
  return _model;
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Cannot load image")); };
    img.src = url;
  });
}

// ─── Label → product search term mapping ──────────────────────────────────────
// MobileNet uses ImageNet class names (very specific). This map expands them to
// the broader terms your products are actually stored under in the database.
// Rule: always include BOTH the specific term AND the category term so the
// backend can match products regardless of how they are named.
const LABEL_MAP: Record<string, string[]> = {
  // ── Fruits ───────────────────────────────────────────────────────────────────
  strawberry:      ["strawberry",   "fruit"],
  pineapple:       ["pineapple",    "fruit"],
  ananas:          ["pineapple",    "fruit"],
  banana:          ["banana",       "fruit"],
  apple:           ["apple",        "fruit"],
  orange:          ["orange",       "fruit"],
  mango:           ["mango",        "fruit"],
  grape:           ["grape",        "fruit"],
  blueberry:       ["blueberry",    "fruit"],
  watermelon:      ["watermelon",   "fruit"],
  peach:           ["peach",        "fruit"],
  fig:             ["fig",          "fruit"],
  pomegranate:     ["pomegranate",  "fruit"],
  lemon:           ["lemon",        "fruit"],
  lime:            ["lime",         "fruit"],
  coconut:         ["coconut",      "fruit"],
  guava:           ["guava",        "fruit"],
  jackfruit:       ["jackfruit",    "fruit"],
  papaya:          ["papaya",       "fruit"],
  cherry:          ["cherry",       "fruit"],
  kiwi:            ["kiwi",         "fruit"],
  melon:           ["melon",        "fruit"],
  plum:            ["plum",         "fruit"],
  raspberry:       ["raspberry",    "fruit"],
  avocado:         ["avocado",      "fruit"],
  "custard apple": ["custard apple","fruit"],
  lychee:          ["lychee",       "fruit"],
  litchi:          ["litchi",       "fruit"],
  date:            ["date",         "fruit"],

  // ── Vegetables ───────────────────────────────────────────────────────────────
  broccoli:        ["broccoli",    "vegetable"],
  carrot:          ["carrot",      "vegetable"],
  cabbage:         ["cabbage",     "vegetable"],
  spinach:         ["spinach",     "vegetable"],
  tomato:          ["tomato",      "vegetable"],
  potato:          ["potato",      "vegetable"],
  onion:           ["onion",       "vegetable"],
  garlic:          ["garlic",      "vegetable"],
  ginger:          ["ginger",      "vegetable"],
  cauliflower:     ["cauliflower", "vegetable"],
  mushroom:        ["mushroom",    "vegetable"],
  cucumber:        ["cucumber",    "vegetable"],
  eggplant:        ["eggplant",    "vegetable"],
  pumpkin:         ["pumpkin",     "vegetable"],
  pepper:          ["pepper",      "vegetable"],

  // ── Meat / Fish ──────────────────────────────────────────────────────────────
  chicken:         ["chicken",  "meat"],
  fish:            ["fish",     "seafood"],
  shrimp:          ["shrimp",   "seafood"],
  prawn:           ["prawn",    "seafood"],
  beef:            ["beef",     "meat"],
  mutton:          ["mutton",   "meat"],
  egg:             ["egg"],

  // ── Grocery / Pantry ─────────────────────────────────────────────────────────
  rice:            ["rice"],
  bread:           ["bread"],
  flour:           ["flour"],
  oil:             ["oil"],
  sugar:           ["sugar"],
  salt:            ["salt"],
  milk:            ["milk",  "dairy"],
  butter:          ["butter","dairy"],
  cheese:          ["cheese","dairy"],
  yogurt:          ["yogurt","dairy"],
  honey:           ["honey"],
  spice:           ["spice"],

  // ── Snacks / Beverages ────────────────────────────────────────────────────────
  chocolate:       ["chocolate"],
  cake:            ["cake"],
  biscuit:         ["biscuit", "cookie"],
  cookie:          ["cookie",  "biscuit"],
  coffee:          ["coffee"],
  tea:             ["tea"],
  juice:           ["juice"],
  water:           ["water"],
  soda:            ["soda",  "drink"],
  icecream:        ["ice cream"],
  "ice cream":     ["ice cream"],

  // ── Electronics ──────────────────────────────────────────────────────────────
  laptop:          ["laptop",     "computer"],
  "laptop computer":["laptop",   "computer"],
  notebook:        ["laptop",     "notebook"],
  computer:        ["computer",   "laptop"],
  keyboard:        ["keyboard"],
  mouse:           ["mouse"],
  monitor:         ["monitor",    "display"],
  television:      ["television", "TV"],
  phone:           ["phone",      "mobile"],
  mobile:          ["mobile",     "phone"],
  smartphone:      ["smartphone", "mobile"],
  tablet:          ["tablet"],
  camera:          ["camera"],
  headphones:      ["headphones", "earphone"],
  earphone:        ["earphone",   "headphones"],
  speaker:         ["speaker"],
  charger:         ["charger"],
  router:          ["router",     "wifi"],
  microphone:      ["microphone"],
  projector:       ["projector"],
  printer:         ["printer"],
  fan:             ["fan"],
  refrigerator:    ["refrigerator","fridge"],
  "washing machine":["washing machine"],
  "air conditioner":["AC",        "air conditioner"],
  "electric fan":  ["fan"],
  iron:            ["iron"],
  blender:         ["blender"],
  oven:            ["oven"],

  // ── Clothing / Fashion ────────────────────────────────────────────────────────
  shirt:           ["shirt",    "clothing"],
  jersey:          ["jersey",   "shirt"],
  "t-shirt":       ["t-shirt",  "shirt"],
  "tee shirt":     ["t-shirt",  "shirt"],
  dress:           ["dress",    "clothing"],
  jeans:           ["jeans",    "pants"],
  pants:           ["pants",    "trouser"],
  trouser:         ["trouser",  "pants"],
  panjabi:         ["panjabi",  "clothing"],
  saree:           ["saree",    "clothing"],
  kurti:           ["kurti",    "clothing"],
  jacket:          ["jacket",   "clothing"],
  coat:            ["coat",     "jacket"],
  hoodie:          ["hoodie",   "sweater"],
  sweater:         ["sweater",  "clothing"],
  shoe:            ["shoe",     "footwear"],
  sneaker:         ["sneaker",  "shoe"],
  "running shoe":  ["shoe",     "sneaker"],
  sandal:          ["sandal",   "footwear"],
  slipper:         ["slipper",  "footwear"],
  boot:            ["boot",     "footwear"],
  bag:             ["bag"],
  handbag:         ["handbag",  "bag"],
  backpack:        ["backpack", "bag"],
  purse:           ["purse",    "bag"],
  wallet:          ["wallet"],
  watch:           ["watch"],
  glasses:         ["glasses",  "sunglasses"],
  sunglasses:      ["sunglasses","glasses"],
  hat:             ["hat"],
  cap:             ["cap",      "hat"],
  scarf:           ["scarf"],
  belt:            ["belt"],
  underwear:       ["underwear"],
  socks:           ["socks"],

  // ── Beauty / Personal Care ────────────────────────────────────────────────────
  lipstick:        ["lipstick", "cosmetic"],
  cream:           ["cream",    "cosmetic"],
  lotion:          ["lotion",   "cosmetic"],
  perfume:         ["perfume"],
  shampoo:         ["shampoo"],
  soap:            ["soap"],
  toothbrush:      ["toothbrush"],
  toothpaste:      ["toothpaste"],
  razor:           ["razor"],
  sunscreen:       ["sunscreen","cosmetic"],

  // ── Home / Furniture ─────────────────────────────────────────────────────────
  chair:           ["chair",    "furniture"],
  table:           ["table",    "furniture"],
  sofa:            ["sofa",     "furniture"],
  bed:             ["bed",      "furniture"],
  lamp:            ["lamp"],
  pillow:          ["pillow"],
  curtain:         ["curtain"],
  carpet:          ["carpet"],
  vase:            ["vase"],
  clock:           ["clock"],

  // ── Sports ────────────────────────────────────────────────────────────────────
  football:        ["football", "sports"],
  "soccer ball":   ["football", "sports"],
  basketball:      ["basketball","sports"],
  cricket:         ["cricket",  "sports"],
  tennis:          ["tennis",   "sports"],
  badminton:       ["badminton","sports"],
  bicycle:         ["bicycle",  "sports"],
  dumbbell:        ["dumbbell", "gym"],
  yoga:            ["yoga",     "sports"],

  // ── Books / Stationery ───────────────────────────────────────────────────────
  book:            ["book"],
  magazine:        ["magazine"],
  pen:             ["pen",      "stationery"],
  pencil:          ["pencil",   "stationery"],
  notebook:        ["notebook"],

  // ── Toys / Kids ──────────────────────────────────────────────────────────────
  toy:             ["toy"],
  "teddy bear":    ["teddy bear","toy"],
  doll:            ["doll",     "toy"],
  puzzle:          ["puzzle",   "toy"],

  // ── Tools / Hardware ─────────────────────────────────────────────────────────
  hammer:          ["hammer",   "tool"],
  screwdriver:     ["screwdriver","tool"],
  drill:           ["drill",    "tool"],
};

/**
 * Given MobileNet predictions, return the best search query for this e-commerce site.
 * Strategy: expand each label into (specific + category) terms, deduplicate,
 * return space-separated so backend word-matching can find any of them.
 */
function buildQuery(predictions: Array<{ className: string; probability: number }>): string {
  const seen  = new Set<string>();
  const terms: string[] = [];

  const add = (t: string) => {
    const key = t.toLowerCase();
    if (!seen.has(key) && key.length > 1) { seen.add(key); terms.push(t.toLowerCase()); }
  };

  for (const pred of predictions) {
    // MobileNet label example: "strawberry pineapple, ananas"
    const parts = pred.className.toLowerCase().split(",").map((p) => p.trim());

    for (const part of parts) {
      // Try exact match (e.g., "custard apple")
      if (LABEL_MAP[part]) {
        LABEL_MAP[part].forEach(add);
        continue;
      }
      // Try each individual word in the part
      const words = part.split(/\s+/);
      let wordMatched = false;
      for (const w of words) {
        if (LABEL_MAP[w]) {
          LABEL_MAP[w].forEach(add);
          wordMatched = true;
        }
      }
      // If nothing matched, just add the first meaningful word as-is
      if (!wordMatched) {
        words.filter((w) => w.length > 2).forEach(add);
      }
    }
  }

  // Limit to 6 terms so the URL stays clean
  return terms.slice(0, 6).join(" ");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useImageClassifier() {
  const dispatch    = useAppDispatch();
  const modelStatus = useAppSelector((s) => s.imageClassifier.status);

  const classify = useCallback(async (file: File): Promise<string> => {
    const model = await loadModel(dispatch);
    const img   = await fileToImage(file);

    const predictions: Array<{ className: string; probability: number }> =
      await model.classify(img, 5);

    return buildQuery(predictions);
  }, [dispatch]);

  const resetModel = useCallback(() => {
    _model = null;
    _loadPromise = null;
    dispatch(modelReset());
  }, [dispatch]);

  return { classify, modelStatus, resetModel };
}
