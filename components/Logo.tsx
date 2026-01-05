import Image from "next/image";

type LogoProps = {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { width: 120, height: 28 },
  md: { width: 160, height: 36 },
  lg: { width: 220, height: 48 },
};

export default function Logo({
  variant = "full",
  size = "md",
  className,
}: LogoProps) {
  const src = variant === "mark" ? "/brand/logo.png" : "/brand/logo.png";
  const dimensions = sizeMap[size];

  return (
    <Image
      src={src}
      alt="Home Equity Check"
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={className}
    />
  );
}
