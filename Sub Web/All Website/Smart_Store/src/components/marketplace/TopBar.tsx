import { Phone, Truck } from "lucide-react";

export default function TopBar() {
  return (
    <div className="border-b border-border bg-card text-xs text-muted-foreground">
      <div className="container flex h-9 items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span>Free delivery on orders over <strong className="text-foreground">৳1,500</strong> · Welcome to Sholok</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-muted-foreground">English</span>
          <a
            href="tel:+8801800000000"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+880 1800-000000</span>
          </a>
        </div>
      </div>
    </div>
  );
}
