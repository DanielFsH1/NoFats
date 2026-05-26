const BLOB_PATH_PATTERN = /^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$/i;

export function getImageProposalPathnames(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidates = [record.pathname, record.thumbnailPathname];
  const pathnames = candidates.flatMap((value) => {
    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();

    if (!BLOB_PATH_PATTERN.test(trimmed)) {
      return [];
    }

    return [trimmed];
  });

  return Array.from(new Set(pathnames));
}
