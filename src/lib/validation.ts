import { z } from "zod";
import { defaultSiteCopy } from "./product/rules";
import { profileThemeStyles } from "./product/profile-themes";
import { cleanUserText } from "./security/text";

const singleLineText = (max: number) =>
  z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().max(max));

const requiredSingleLineText = (max: number, requiredMessage: string) =>
  z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1, requiredMessage).max(max));

const requiredMultilineText = (max: number, requiredMessage: string) =>
  z
    .string()
    .transform((value) => cleanUserText(value, { multiline: true }))
    .pipe(z.string().min(1, requiredMessage).max(max));

export const emailSchema = z
  .string()
  .transform((value) => cleanUserText(value).toLowerCase())
  .pipe(z.string().email("Usa un correo valido."));
export const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(72, "La contrasena no puede superar 72 caracteres.");
export const bodySchema = requiredMultilineText(
  1600,
  "El contenido no puede estar vacio.",
);
export const shortTextSchema = requiredSingleLineText(
  80,
  "Este campo es obligatorio.",
);

export const profileSchema = z.object({
  fullName: singleLineText(160).optional(),
  bio: singleLineText(240).optional(),
  description: z
    .string()
    .transform((value) => cleanUserText(value, { multiline: true }))
    .pipe(z.string().max(1200))
    .optional(),
  phrase: singleLineText(140).optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Usa un color hexadecimal valido.")
    .optional(),
  themeStyle: z.enum(profileThemeStyles).default("AURORA"),
});

export const inviteRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: requiredSingleLineText(160, "Escribe el nombre completo.").pipe(
      z.string().min(3, "Escribe el nombre completo."),
    ),
    token: z.string().min(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export const imageFileSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  size: z.number().max(5 * 1024 * 1024, "La imagen no puede superar 5 MB."),
});

export const voteSettingsSchema = z.object({
  approvalPercentage: z.coerce
    .number()
    .int("Usa un numero entero.")
    .min(1, "El porcentaje minimo es 1.")
    .max(100, "El porcentaje maximo es 100."),
  rejectionPercentage: z.coerce
    .number()
    .int("Usa un numero entero.")
    .min(1, "El porcentaje minimo es 1.")
    .max(100, "El porcentaje maximo es 100."),
});

export const siteCopySchema = z.object({
  appName: requiredSingleLineText(40, "Este campo es obligatorio.").default(
    defaultSiteCopy.appName,
  ),
  loginEyebrow: z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1).max(80))
    .default(defaultSiteCopy.loginEyebrow),
  loginHeroTitle: z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1).max(120))
    .default(defaultSiteCopy.loginHeroTitle),
  loginHeroSubtitle: z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1).max(180))
    .default(defaultSiteCopy.loginHeroSubtitle),
  dashboardTitle: z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1).max(80))
    .default(defaultSiteCopy.dashboardTitle),
  dashboardSubtitle: z
    .string()
    .transform((value) => cleanUserText(value))
    .pipe(z.string().min(1).max(220))
    .default(defaultSiteCopy.dashboardSubtitle),
});

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
