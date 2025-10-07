// src/components/SafeImage.tsx
import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  /** Image de secours si src est vide/invalide */
  fallbackSrc?: string;
};

export default function SafeImage({ src, alt, fallbackSrc = "/placeholder.jpg", ...rest }: Props) {
  const finalSrc =
    typeof src === "string" && src.trim().length > 0 ? src.trim() : fallbackSrc;
  return <Image src={finalSrc} alt={alt} {...rest} />;
}
