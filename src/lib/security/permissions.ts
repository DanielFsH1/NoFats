export class PrivateMediaAccessError extends Error {
  constructor(readonly status: 401 | 404) {
    super(status === 401 ? "Unauthorized" : "Not found");
  }
}

export function assertCanViewPrivateMedia(
  session: { user?: { disabled?: boolean | null } | null } | null,
) {
  if (!session?.user) {
    throw new PrivateMediaAccessError(401);
  }

  if (session.user.disabled) {
    throw new PrivateMediaAccessError(404);
  }
}
