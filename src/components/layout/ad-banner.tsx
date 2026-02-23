import Image from "next/image";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  imageUrl?: string;
  href?: string;
  alt?: string;
  className?: string;
}

export function AdBanner({
  imageUrl,
  href,
  alt = "Anúncio",
  className,
}: AdBannerProps) {
  if (!imageUrl) return null;

  const content = (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={800}
        height={200}
        className="w-full h-auto object-cover"
      />
      <span className="absolute top-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/70">
        Anúncio
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
