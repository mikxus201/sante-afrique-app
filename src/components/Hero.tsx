import Image from "next/image";

type Props = {
  title: string;
  subtitle?: string;
  image?: string;     // ex: /heroes/about.jpg (public)
  align?: "left" | "center" | "right";
  children?: React.ReactNode;
};

export default function Hero({
  title,
  subtitle,
  image,
  align = "center",
  children,
}: Props) {
  const justify =
    align === "left" ? "items-start text-left" :
    align === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <section className="relative w-full overflow-hidden">
      {/* Fond image */}
      <div className="relative h-[240px] md:h-[300px] w-full">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-700 to-cyan-600" />
        )}
        {/* Overlay dégradé pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>

      {/* Contenu */}
      <div className="absolute inset-0">
        <div className={`mx-auto max-w-6xl h-full px-4 flex ${justify} justify-center md:justify-start`}>
          <div className="self-end pb-8 md:pb-10 text-white drop-shadow">
            <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm md:text-base opacity-90">
                {subtitle}
              </p>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
