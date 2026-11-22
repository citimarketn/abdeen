import { IconStar } from "./icons";
import { cn } from "@/lib/utils";

export default function RatingStars({
  value,
  size = "sm",
  className,
}: {
  value: number | null | undefined;
  size?: "xs" | "sm" | "lg";
  className?: string;
}) {
  const v = value ?? 0;
  const sizes = { xs: "h-3.5 w-3.5", sm: "h-4 w-4", lg: "h-5 w-5" };
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-gold", className)}
      aria-label={`التقييم ${v} من 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar
          key={i}
          filled={v >= i - 0.25}
          half={v >= i - 0.75 && v < i - 0.25}
          className={cn(sizes[size], v < i - 0.25 && "text-ink/15")}
        />
      ))}
    </span>
  );
}
