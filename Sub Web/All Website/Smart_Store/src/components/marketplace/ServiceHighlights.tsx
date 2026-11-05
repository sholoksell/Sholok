import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const SERVICES = [
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders over ৳999",
    color: "text-[#5D0096]",
    bg: "bg-purple-50",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "100% protected checkout",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "7-day return policy",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated customer help",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function ServiceHighlights() {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-card transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
