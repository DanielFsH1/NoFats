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
      banner: string;
      surface: string;
      panel: string;
      text: string;
      muted: string;
      ring: string;
      badge: string;
    }
  > = {
    AURORA: {
      banner: `radial-gradient(circle at 18% 18%, color-mix(in srgb, ${color} 34%, white), transparent 28%), linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 42%, #7dd3fc))`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, white), var(--surface))",
      panel: "color-mix(in srgb, var(--surface) 86%, white)",
      text: "var(--foreground)",
      muted: "var(--muted)",
      ring: color,
      badge: "color-mix(in srgb, var(--accent) 14%, transparent)",
    },
    SUNSET: {
      banner: `radial-gradient(circle at 80% 16%, #fde68a, transparent 26%), linear-gradient(135deg, ${color}, #fb7185 54%, #f97316)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #fff7ed 58%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #fff7ed 72%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 88%, #9a3412)",
      ring: "#f97316",
      badge: "color-mix(in srgb, #f97316 13%, transparent)",
    },
    FOREST: {
      banner: `linear-gradient(135deg, #052e16, ${color} 48%, #86efac)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #ecfdf5 45%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #ecfdf5 68%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 86%, #166534)",
      ring: "#16a34a",
      badge: "color-mix(in srgb, #16a34a 13%, transparent)",
    },
    NEON: {
      banner: `radial-gradient(circle at 28% 28%, ${color}, transparent 26%), linear-gradient(135deg, #111827, #312e81 48%, #db2777)`,
      surface: "linear-gradient(180deg, #111827, #1f2937)",
      panel: "color-mix(in srgb, #111827 88%, white)",
      text: "#f8fafc",
      muted: "#cbd5e1",
      ring: "#a78bfa",
      badge: "rgb(167 139 250 / 0.2)",
    },
    PAPER: {
      banner: `linear-gradient(135deg, color-mix(in srgb, ${color} 16%, white), #f8fafc 48%, color-mix(in srgb, ${color} 28%, white))`,
      surface: "linear-gradient(180deg, #ffffff, #f8fafc)",
      panel: "#ffffff",
      text: "#0f172a",
      muted: "#475569",
      ring: color,
      badge: "color-mix(in srgb, #0f766e 10%, transparent)",
    },
  };

  return themes[normalizedStyle];
}
