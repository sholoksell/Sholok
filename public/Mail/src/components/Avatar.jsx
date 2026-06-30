export default function Avatar({ name, color, initials, size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      title={name}
    >
      {initials}
    </div>
  );
}
