export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface-light dark:bg-surface-dark">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-500/15 dark:bg-violet-500/10 blur-3xl animate-float" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-400/15 dark:bg-sky-400/8 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/15 dark:bg-fuchsia-400/8 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
    </div>
  );
}
