

export default function Footer() {
  return (
    <footer className="container pb-12 pt-20">
      <div className="rounded-4xl bg-gradient-soft p-8 lg:p-12 grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg leading-none">S</span>
            </div>
            <span className="font-display font-bold text-xl">Sholok <span className="gradient-text">Smart Store</span></span>
          </div>
          <p className="text-sm text-foreground/70 max-w-sm leading-relaxed mb-4">
            The modern marketplace for thoughtful shoppers and the stores they love.
          </p>
          <div className="flex gap-2">
            <input placeholder="Get drops in your inbox" className="flex-1 h-11 px-4 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <button className="h-11 px-5 rounded-2xl bg-foreground text-background font-semibold text-sm">Subscribe</button>
          </div>
        </div>

        {[
          { title: "Shop", links: ["New arrivals", "Best sellers", "Flash deals", "Stores"] },
          { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold mb-3 text-sm">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
