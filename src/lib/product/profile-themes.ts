export const profileThemeStyles = [
  "AURORA",
  "SUNSET",
  "FOREST",
  "NEON",
  "PAPER",
] as const;

export type ProfileThemeStyle = (typeof profileThemeStyles)[number];

export const profileThemeOptions: {
  value: ProfileThemeStyle;
  label: string;
  description: string;
  accent: string;
}[] = [
  {
    value: "AURORA",
    label: "Aurora",
    description: "Color base con luz suave y bordes frescos.",
    accent: "#14b8a6",
  },
  {
    value: "SUNSET",
    label: "Atardecer",
    description: "Contraste calido con fondo coral.",
    accent: "#f97316",
  },
  {
    value: "FOREST",
    label: "Bosque",
    description: "Verdes profundos y superficies tranquilas.",
    accent: "#16a34a",
  },
  {
    value: "NEON",
    label: "Neon",
    description: "Fondo oscuro con brillo marcado.",
    accent: "#8b5cf6",
  },
  {
    value: "PAPER",
    label: "Papel",
    description: "Claro, limpio y editorial.",
    accent: "#0f766e",
  },
];

export function getProfileTheme(style?: string | null, color = "#1f8a70") {
  const normalizedStyle = profileThemeStyles.includes(
    style as ProfileThemeStyle,
  )
    ? (style as ProfileThemeStyle)
    : "AURORA";

  const themes: Record<
    ProfileThemeStyle,
    {
      page: string;
      banner: string;
      surface: string;
      panel: string;
      surfaceMuted: string;
      surfaceStrong: string;
      text: string;
      muted: string;
      border: string;
      ring: string;
      accentInk: string;
      badge: string;
      shadow: string;
      shadowSoft: string;
    }
  > = {
    AURORA: {
      page: `radial-gradient(circle at 18% 8%, color-mix(in srgb, ${color} 22%, transparent), transparent 28rem), radial-gradient(circle at 88% 4%, rgb(125 211 252 / 18%), transparent 26rem), linear-gradient(180deg, color-mix(in srgb, ${color} 10%, var(--background)), var(--background) 46%, color-mix(in srgb, ${color} 7%, var(--background)))`,
      banner: `radial-gradient(circle at 18% 18%, color-mix(in srgb, ${color} 34%, white), transparent 28%), linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 42%, #7dd3fc))`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, white), var(--surface))",
      panel: "color-mix(in srgb, var(--surface) 86%, white)",
      surfaceMuted: "color-mix(in srgb, var(--surface) 80%, white)",
      surfaceStrong: "color-mix(in srgb, var(--surface) 72%, white)",
      text: "var(--foreground)",
      muted: "var(--muted)",
      border: `color-mix(in srgb, ${color} 30%, var(--border))`,
      ring: color,
      accentInk: "var(--accent-ink)",
      badge: "color-mix(in srgb, var(--accent) 14%, transparent)",
      shadow: `0 22px 62px color-mix(in srgb, ${color} 18%, transparent)`,
      shadowSoft: `0 12px 34px color-mix(in srgb, ${color} 13%, transparent)`,
    },
    SUNSET: {
      page: `radial-gradient(circle at 82% 10%, rgb(253 230 138 / 32%), transparent 25rem), radial-gradient(circle at 12% 18%, color-mix(in srgb, ${color} 24%, transparent), transparent 28rem), linear-gradient(180deg, color-mix(in srgb, #fff7ed 62%, var(--background)), color-mix(in srgb, #fb7185 8%, var(--background)))`,
      banner: `radial-gradient(circle at 80% 16%, #fde68a, transparent 26%), linear-gradient(135deg, ${color}, #fb7185 54%, #f97316)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #fff7ed 58%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #fff7ed 72%, var(--surface))",
      surfaceMuted: "color-mix(in srgb, #ffedd5 55%, var(--surface))",
      surfaceStrong: "color-mix(in srgb, #fed7aa 44%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 88%, #9a3412)",
      border: "color-mix(in srgb, #f97316 34%, var(--border))",
      ring: "#f97316",
      accentInk: "#9a3412",
      badge: "color-mix(in srgb, #f97316 13%, transparent)",
      shadow: "0 22px 62px rgb(154 52 18 / 16%)",
      shadowSoft: "0 12px 34px rgb(154 52 18 / 12%)",
    },
    FOREST: {
      page: `radial-gradient(circle at 12% 10%, color-mix(in srgb, ${color} 24%, transparent), transparent 28rem), radial-gradient(circle at 88% 8%, rgb(134 239 172 / 22%), transparent 24rem), linear-gradient(180deg, color-mix(in srgb, #ecfdf5 54%, var(--background)), color-mix(in srgb, #052e16 8%, var(--background)))`,
      banner: `linear-gradient(135deg, #052e16, ${color} 48%, #86efac)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #ecfdf5 45%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #ecfdf5 68%, var(--surface))",
      surfaceMuted: "color-mix(in srgb, #dcfce7 48%, var(--surface))",
      surfaceStrong: "color-mix(in srgb, #bbf7d0 38%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 86%, #166534)",
      border: "color-mix(in srgb, #16a34a 32%, var(--border))",
      ring: "#16a34a",
      accentInk: "#14532d",
      badge: "color-mix(in srgb, #16a34a 13%, transparent)",
      shadow: "0 22px 62px rgb(20 83 45 / 16%)",
      shadowSoft: "0 12px 34px rgb(20 83 45 / 12%)",
    },
    NEON: {
      page: `radial-gradient(circle at 24% 8%, color-mix(in srgb, ${color} 42%, transparent), transparent 28rem), radial-gradient(circle at 86% 10%, rgb(219 39 119 / 28%), transparent 27rem), linear-gradient(180deg, #070b16, #111827 48%, #1f2937)`,
      banner: `radial-gradient(circle at 28% 28%, ${color}, transparent 26%), linear-gradient(135deg, #111827, #312e81 48%, #db2777)`,
      surface: "linear-gradient(180deg, #111827, #1f2937)",
      panel: "color-mix(in srgb, #111827 88%, white)",
      surfaceMuted: "color-mix(in srgb, #111827 78%, white)",
      surfaceStrong: "color-mix(in srgb, #111827 64%, white)",
      text: "#f8fafc",
      muted: "#cbd5e1",
      border: "rgb(167 139 250 / 0.42)",
      ring: "#a78bfa",
      accentInk: "#f5f3ff",
      badge: "rgb(167 139 250 / 0.2)",
      shadow: "0 24px 70px rgb(0 0 0 / 44%)",
      shadowSoft: "0 14px 38px rgb(0 0 0 / 30%)",
    },
    PAPER: {
      page: `radial-gradient(circle at 12% 8%, color-mix(in srgb, ${color} 12%, transparent), transparent 28rem), linear-gradient(180deg, #ffffff, #f8fafc 54%, color-mix(in srgb, ${color} 5%, #f8fafc))`,
      banner: `linear-gradient(135deg, color-mix(in srgb, ${color} 16%, white), #f8fafc 48%, color-mix(in srgb, ${color} 28%, white))`,
      surface: "linear-gradient(180deg, #ffffff, #f8fafc)",
      panel: "#ffffff",
      surfaceMuted: "#f8fafc",
      surfaceStrong: "#eef2f7",
      text: "#0f172a",
      muted: "#475569",
      border: "color-mix(in srgb, #0f766e 20%, #cbd5e1)",
      ring: color,
      accentInk: "#134e4a",
      badge: "color-mix(in srgb, #0f766e 10%, transparent)",
      shadow: "0 22px 62px rgb(15 23 42 / 10%)",
      shadowSoft: "0 12px 34px rgb(15 23 42 / 8%)",
    },
  };

  return themes[normalizedStyle];
}
