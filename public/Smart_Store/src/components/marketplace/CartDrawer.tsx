import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cartContext";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

export default function CartDrawer() {
  const { isOpen, close, items, setQuantity, remove, total } = useCart();
  const { language, t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-elegant flex flex-col"
          >
            <header className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-display text-xl font-bold">{t("cart")}</h2>
                <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 && "s"}</p>
              </div>
              <button onClick={close} className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-soft flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{t("emptyCart")}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{language === "bn" ? "আপনার পছন্দের আইটেমগুলো যোগ করুন, সেগুলো এখানে দেখা যাবে।" : "Add items you love and they'll appear here. We'll save them for you."}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 rounded-2xl bg-secondary/50"
                    >
                      <img src={item.image} alt={getLocalizedField(item, "name", language)} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.brand}</p>
                        <h4 className="text-sm font-semibold line-clamp-2 mb-1">{getLocalizedField(item, "name", language)}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-background rounded-full p-1">
                            <button
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="w-6 text-center text-xs font-semibold tabular-nums"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <motion.span
                            key={item.price * item.quantity}
                            initial={{ y: -4, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="font-bold text-sm tabular-nums"
                          >
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </motion.span>
                        </div>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors self-start">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <footer className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-semibold tabular-nums">
                    ৳{total.toLocaleString()}
                  </motion.span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping")}</span>
                  <span className="font-semibold text-accent-mint">{t("free")}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="font-semibold">{t("total")}</span>
                  <span className="font-display text-2xl font-bold tabular-nums">৳{total.toLocaleString()}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-2xl bg-gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-elegant"
                >
                  {language === "bn" ? "নিরাপদে চেকআউট করুন" : "Checkout securely"} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
