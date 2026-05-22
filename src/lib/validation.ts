import { z } from "zod";

export const emailSchema = z.string().trim().email("Usa un correo valido.");
export const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(72, "La contrasena no puede superar 72 caracteres.");
export const bodySchema = z
  .string()
  .trim()
  .min(1, "El contenido no puede estar vacio.")
  .max(1600, "El contenido es demasiado largo.");
export const shortTextSchema = z
  .string()
  .trim()
  .min(1, "Este campo es obligatorio.")
  .max(80, "Usa 80 caracteres o menos.");

export const profileSchema = z.object({
  fullName: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(240).optional(),
  description: z.string().trim().max(1200).optional(),
  phrase: z.string().trim().max(140).optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Usa un color hexadecimal valido.")
    .optional(),
});

export const inviteRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: z
      .string()
      .trim()
      .min(3, "Escribe el nombre completo.")
      .max(160, "El nombre completo es demasiado largo."),
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

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
