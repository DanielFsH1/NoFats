import { createId } from "@paralleldrive/cuid2";

export function id(prefix: string) {
  return `${prefix}_${createId()}`;
}
