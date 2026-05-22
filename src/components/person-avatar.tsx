import Image from "next/image";

type DailyPhoto = {
  id: string;
  altText?: string | null;
} | null;

const sizeClasses = {
  sm: "size-12 rounded-2xl text-base",
  md: "size-16 rounded-3xl text-xl",
  lg: "size-24 rounded-[28px] text-3xl",
  xl: "size-32 rounded-[34px] text-4xl",
};

export function PersonAvatar({
  dailyPhoto,
  name,
  size = "md",
  className = "",
}: {
  dailyPhoto?: DailyPhoto;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const initials = getInitials(name);

  return (
    <div
      className={`avatar-frame relative grid shrink-0 place-items-center overflow-hidden border-4 border-[var(--surface)] bg-[var(--surface-strong)] font-black ${sizeClasses[size]} ${className}`}
    >
      {dailyPhoto ? (
        <Image
          src={`/api/media/${dailyPhoto.id}`}
          alt={dailyPhoto.altText || `Foto de ${name}`}
          fill
          sizes="(max-width: 640px) 96px, 144px"
          unoptimized
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NF"
  );
}
