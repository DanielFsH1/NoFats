export const profileThemeStyles = [
  "AURORA",
  "SUNSET",
  "FOREST",
  "NEON",
  "PAPER",
] as const;

export type ProfileThemeStyle = (typeof profileThemeStyles)[number];

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const fallbackThemeColor = "#1f8a70";
const darkInk = "#0f172a";
const lightInk = "#ffffff";

function normalizeHexColor(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color)
    ? color.toLowerCase()
    : fallbackThemeColor;
}

function hexToRgb(color: string): Rgb {
  const normalized = normalizeHexColor(color);
  const value = Number.parseInt(normalized.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixRgb(base: Rgb, mix: Rgb, amount: number): Rgb {
  return {
    r: base.r + (mix.r - base.r) * amount,
    g: base.g + (mix.g - base.g) * amount,
    b: base.b + (mix.b - base.b) * amount,
  };
}

function relativeLuminance(color: string) {
  const { r, g, b } = hexToRgb(color);
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function readableTextFor(background: string) {
  return getContrastRatio(lightInk, background) >=
    getContrastRatio(darkInk, background)
    ? lightInk
    : darkInk;
}

function pushColorUntilReadable(
  color: string,
  background: string,
  direction: "darken" | "lighten",
) {
  let current = normalizeHexColor(color);
  const target =
    direction === "darken" ? hexToRgb("#000000") : hexToRgb("#ffffff");

  for (let step = 0; step < 18; step += 1) {
    if (getContrastRatio(current, background) >= 4.5) {
      return current;
    }

    current = rgbToHex(mixRgb(hexToRgb(current), target, 0.14));
  }

  return current;
}

function createAccent(
  color: string,
  background: string,
  mode: "light" | "dark",
) {
  const source = normalizeHexColor(color);
  const accent = pushColorUntilReadable(
    source,
    background,
    mode === "dark" ? "lighten" : "darken",
  );
  const accentContrast = readableTextFor(accent);
  const accentHover = rgbToHex(
    mixRgb(
      hexToRgb(accent),
      hexToRgb(mode === "dark" ? "#ffffff" : "#000000"),
      0.14,
    ),
  );

  return {
    source,
    accent,
    accentContrast,
    accentHover,
    accentInk: pushColorUntilReadable(
      source,
      background,
      mode === "dark" ? "lighten" : "darken",
    ),
  };
}

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
  const sourceColor = normalizeHexColor(color);
  const auroraAccent = createAccent(sourceColor, "#ffffff", "light");
  const sunsetAccent = createAccent("#ea580c", "#fff7ed", "light");
  const forestAccent = createAccent("#15803d", "#ecfdf5", "light");
  const neonAccent = createAccent(sourceColor, "#111827", "dark");
  const paperAccent = createAccent(sourceColor, "#ffffff", "light");
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
      accent: string;
      accentInk: string;
      accentContrast: string;
      accentHover: string;
      badge: string;
      shadow: string;
      shadowSoft: string;
    }
  > = {
    AURORA: {
      page: `radial-gradient(circle at 18% 8%, color-mix(in srgb, ${sourceColor} 14%, transparent), transparent 28rem), radial-gradient(circle at 88% 4%, rgb(125 211 252 / 12%), transparent 26rem), linear-gradient(180deg, color-mix(in srgb, ${sourceColor} 7%, var(--background)), var(--background) 48%, color-mix(in srgb, ${sourceColor} 5%, var(--background)))`,
      banner: `radial-gradient(circle at 18% 18%, color-mix(in srgb, ${sourceColor} 24%, white), transparent 30%), linear-gradient(135deg, ${sourceColor}, color-mix(in srgb, ${sourceColor} 38%, #7dd3fc))`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, white), var(--surface))",
      panel: "color-mix(in srgb, var(--surface) 86%, white)",
      surfaceMuted: "color-mix(in srgb, var(--surface) 80%, white)",
      surfaceStrong: "color-mix(in srgb, var(--surface) 72%, white)",
      text: "var(--foreground)",
      muted: "var(--muted)",
      border: `color-mix(in srgb, ${auroraAccent.accent} 22%, var(--border))`,
      ring: auroraAccent.accent,
      accent: auroraAccent.accent,
      accentInk: auroraAccent.accentInk,
      accentContrast: auroraAccent.accentContrast,
      accentHover: auroraAccent.accentHover,
      badge: `color-mix(in srgb, ${auroraAccent.accent} 12%, transparent)`,
      shadow: `0 22px 62px color-mix(in srgb, ${sourceColor} 12%, transparent)`,
      shadowSoft: `0 12px 34px color-mix(in srgb, ${sourceColor} 9%, transparent)`,
    },
    SUNSET: {
      page: `radial-gradient(circle at 82% 10%, rgb(253 230 138 / 22%), transparent 25rem), radial-gradient(circle at 12% 18%, color-mix(in srgb, ${sourceColor} 14%, transparent), transparent 28rem), linear-gradient(180deg, color-mix(in srgb, #fff7ed 54%, var(--background)), color-mix(in srgb, #fb7185 5%, var(--background)))`,
      banner: `radial-gradient(circle at 80% 16%, #fde68a, transparent 26%), linear-gradient(135deg, ${sourceColor}, #fb7185 54%, #ea580c)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #fff7ed 58%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #fff7ed 72%, var(--surface))",
      surfaceMuted: "color-mix(in srgb, #ffedd5 55%, var(--surface))",
      surfaceStrong: "color-mix(in srgb, #fed7aa 44%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 88%, #9a3412)",
      border: "color-mix(in srgb, #f97316 34%, var(--border))",
      ring: sunsetAccent.accent,
      accent: sunsetAccent.accent,
      accentInk: "#9a3412",
      accentContrast: sunsetAccent.accentContrast,
      accentHover: sunsetAccent.accentHover,
      badge: "color-mix(in srgb, #f97316 13%, transparent)",
      shadow: "0 22px 62px rgb(154 52 18 / 16%)",
      shadowSoft: "0 12px 34px rgb(154 52 18 / 12%)",
    },
    FOREST: {
      page: `radial-gradient(circle at 12% 10%, color-mix(in srgb, ${sourceColor} 14%, transparent), transparent 28rem), radial-gradient(circle at 88% 8%, rgb(134 239 172 / 14%), transparent 24rem), linear-gradient(180deg, color-mix(in srgb, #ecfdf5 48%, var(--background)), color-mix(in srgb, #052e16 5%, var(--background)))`,
      banner: `linear-gradient(135deg, #052e16, ${sourceColor} 48%, #86efac)`,
      surface:
        "linear-gradient(180deg, color-mix(in srgb, #ecfdf5 45%, var(--surface)), var(--surface))",
      panel: "color-mix(in srgb, #ecfdf5 68%, var(--surface))",
      surfaceMuted: "color-mix(in srgb, #dcfce7 48%, var(--surface))",
      surfaceStrong: "color-mix(in srgb, #bbf7d0 38%, var(--surface))",
      text: "var(--foreground)",
      muted: "color-mix(in srgb, var(--muted) 86%, #166534)",
      border: "color-mix(in srgb, #16a34a 32%, var(--border))",
      ring: forestAccent.accent,
      accent: forestAccent.accent,
      accentInk: "#14532d",
      accentContrast: forestAccent.accentContrast,
      accentHover: forestAccent.accentHover,
      badge: "color-mix(in srgb, #16a34a 13%, transparent)",
      shadow: "0 22px 62px rgb(20 83 45 / 16%)",
      shadowSoft: "0 12px 34px rgb(20 83 45 / 12%)",
    },
    NEON: {
      page: `radial-gradient(circle at 24% 8%, color-mix(in srgb, ${sourceColor} 26%, transparent), transparent 28rem), radial-gradient(circle at 86% 10%, rgb(219 39 119 / 18%), transparent 27rem), linear-gradient(180deg, #070b16, #111827 48%, #1f2937)`,
      banner: `radial-gradient(circle at 28% 28%, ${sourceColor}, transparent 26%), linear-gradient(135deg, #111827, #312e81 48%, #db2777)`,
      surface: "linear-gradient(180deg, #111827, #1f2937)",
      panel: "color-mix(in srgb, #111827 88%, white)",
      surfaceMuted: "color-mix(in srgb, #111827 78%, white)",
      surfaceStrong: "color-mix(in srgb, #111827 64%, white)",
      text: "#f8fafc",
      muted: "#cbd5e1",
      border: "rgb(167 139 250 / 0.42)",
      ring: neonAccent.accent,
      accent: neonAccent.accent,
      accentInk: neonAccent.accentInk,
      accentContrast: neonAccent.accentContrast,
      accentHover: neonAccent.accentHover,
      badge: "rgb(167 139 250 / 0.2)",
      shadow: "0 24px 70px rgb(0 0 0 / 44%)",
      shadowSoft: "0 14px 38px rgb(0 0 0 / 30%)",
    },
    PAPER: {
      page: `radial-gradient(circle at 12% 8%, color-mix(in srgb, ${sourceColor} 8%, transparent), transparent 28rem), linear-gradient(180deg, #ffffff, #f8fafc 54%, color-mix(in srgb, ${sourceColor} 4%, #f8fafc))`,
      banner: `linear-gradient(135deg, color-mix(in srgb, ${sourceColor} 12%, white), #f8fafc 48%, color-mix(in srgb, ${sourceColor} 22%, white))`,
      surface: "linear-gradient(180deg, #ffffff, #f8fafc)",
      panel: "#ffffff",
      surfaceMuted: "#f8fafc",
      surfaceStrong: "#eef2f7",
      text: "#0f172a",
      muted: "#475569",
      border: "color-mix(in srgb, #0f766e 20%, #cbd5e1)",
      ring: paperAccent.accent,
      accent: paperAccent.accent,
      accentInk: paperAccent.accentInk,
      accentContrast: paperAccent.accentContrast,
      accentHover: paperAccent.accentHover,
      badge: "color-mix(in srgb, #0f766e 10%, transparent)",
      shadow: "0 22px 62px rgb(15 23 42 / 10%)",
      shadowSoft: "0 12px 34px rgb(15 23 42 / 8%)",
    },
  };

  return themes[normalizedStyle];
}
