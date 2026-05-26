const unsafeControlCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g;

export function cleanUserText(
  value: string,
  options: { multiline?: boolean; maxLength?: number } = {},
) {
  const normalized = value
    .normalize("NFC")
    .replace(unsafeControlCharacters, "")
    .replace(/\r\n?/g, "\n");

  const cleaned = options.multiline
    ? normalized
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .trim()
    : normalized.replace(/\s+/g, " ").trim();

  return typeof options.maxLength === "number"
    ? cleaned.slice(0, options.maxLength)
    : cleaned;
}
