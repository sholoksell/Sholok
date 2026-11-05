import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { bannersApi } from "@/lib/api";

type OfferBanner = { id: string | number; image?: string; title?: string; link?: string; discount?: string };

const SESSION_KEY = "sholok_offer_seen";

export default function OfferPopup() {
  const [offer, setOffer] = useState<OfferBanner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch { /* blocked storage */ }

    bannersApi.list({ slot: "popup" } as any)
      .then((r: any) => {
        const list = r?.banners || r?.data || (Array.isArray(r) ? r : []);
        const item = list[0];
        if (item?.image || item?.title) {
          setOffer(item);
          setTimeout(() => setVisible(true), 1500);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* blocked */ }
  };

  if (!offer || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={dismiss}
    >
      <div
        className="relative bg-card rounded-xl overflow-hidden max-w-md w-full shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          aria-label="Close offer"
        >
          <X className="w-4 h-4" />
        </button>

        {offer.image && (
          <img src={offer.image} alt={offer.title || "Special offer"} className="w-full h-52 object-cover" />
        )}

        <div className="p-5 text-center">
          {offer.discount && (
            <p className="text-3xl font-bold text-[#D31710] mb-1">{offer.discount} OFF</p>
          )}
          {offer.title && <h3 className="text-lg font-semibold mb-2">{offer.title}</h3>}
          {offer.link ? (
            <Link
              to={offer.link}
              onClick={dismiss}
              className="inline-block px-6 py-2.5 rounded bg-[#5D0096] text-white font-semibold text-sm hover:bg-[#4a0078] transition-colors"
            >
              Shop Now
            </Link>
          ) : (
            <button
              onClick={dismiss}
              className="px-6 py-2.5 rounded bg-[#5D0096] text-white font-semibold text-sm hover:bg-[#4a0078] transition-colors"
            >
              Shop Now
            </button>
          )}
          <button onClick={dismiss} className="block mt-3 text-xs text-muted-foreground hover:underline mx-auto">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
