interface TakaIconProps {
  className?: string;
}

export default function TakaIcon({ className = "" }: TakaIconProps) {
  return (
    <span className={`font-bold leading-none ${className}`} style={{ fontFamily: "inherit" }}>
      ৳
    </span>
  );
}
