type ProposalType =
  | "ADD_NICKNAME"
  | "REMOVE_NICKNAME"
  | "ADD_IMAGE"
  | "REMOVE_POST"
  | "CREATE_FICTIONAL_PERSON"
  | "UPDATE_SITE_COPY"
  | "GENERIC_CHANGE";

type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "APPLIED";

type VoteDecision = "APPROVE" | "REJECT";

export type ProposalCopyInput = {
  type: ProposalType;
  title: string;
  summary: string;
  payload: unknown;
  createdByName: string;
  creatorDisplayName?: string | null;
  targetDisplayName?: string | null;
};

export function proposalTypeLabel(type: ProposalType) {
  const labels: Record<ProposalType, string> = {
    ADD_NICKNAME: "Apodo",
    REMOVE_NICKNAME: "Quitar apodo",
    ADD_IMAGE: "Foto",
    REMOVE_POST: "Moderacion",
    CREATE_FICTIONAL_PERSON: "Nuevo perfil",
    UPDATE_SITE_COPY: "Textos",
    GENERIC_CHANGE: "Cambio",
  };

  return labels[type] ?? "Propuesta";
}

export function proposalStatusLabel(status: ProposalStatus) {
  const labels: Record<ProposalStatus, string> = {
    PENDING: "En votacion",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    CANCELLED: "Cancelada",
    APPLIED: "Aplicada",
  };

  return labels[status] ?? "Propuesta";
}

export function voteDecisionLabel(decision: VoteDecision) {
  return decision === "APPROVE" ? "A favor" : "En contra";
}

export function slotStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    USED: "Usado",
    DISABLED: "Desactivado",
    EXPIRED: "Expirado",
  };

  return labels[status] ?? status;
}

export function roleLabel(role: string) {
  return role === "ADMIN" ? "Administrador" : "Usuario";
}

export function activityTypeLabel(type: string) {
  const labels: Record<string, string> = {
    "admin.slot_created": "Cupo creado",
    "person.fictional_created": "Perfil creado",
    "proposal.created": "Propuesta nueva",
    "settings.site_copy_updated": "Textos actualizados",
    "settings.voting_updated": "Votacion ajustada",
    "person.updated": "Perfil editado",
    "nickname.added": "Apodo agregado",
    "post.reply_created": "Respuesta nueva",
    "post.created": "Publicacion nueva",
    "comment.created": "Comentario nuevo",
    "proposal.applied": "Propuesta aplicada",
    "registration.completed": "Registro completado",
  };

  return labels[type] ?? "Actividad";
}

export function proposalDisplayTitle(input: ProposalCopyInput) {
  const payload = readPayload(input.payload);
  const actor = clean(input.creatorDisplayName) ?? clean(input.createdByName) ?? "Alguien";
  const target = clean(input.targetDisplayName);

  if (input.type === "ADD_NICKNAME") {
    const value = clean(payload.value) ?? "un apodo";
    return target
      ? `${actor} quiere sumar "${value}" a ${target}`
      : `${actor} quiere sumar "${value}"`;
  }

  if (input.type === "REMOVE_NICKNAME") {
    const value = clean(payload.value) ?? "un apodo";
    return target
      ? `${actor} quiere quitar "${value}" de ${target}`
      : `${actor} quiere quitar "${value}"`;
  }

  if (input.type === "ADD_IMAGE") {
    return target
      ? `${actor} compartio una foto para ${target}`
      : `${actor} compartio una foto`;
  }

  if (input.type === "REMOVE_POST") {
    return target
      ? `${actor} pidio borrar una publicacion en ${target}`
      : `${actor} pidio borrar una publicacion`;
  }

  if (input.type === "CREATE_FICTIONAL_PERSON") {
    const value = clean(payload.displayName) ?? "un perfil";
    return `${actor} quiere crear "${value}"`;
  }

  if (input.type === "UPDATE_SITE_COPY") {
    return `${actor} propone cambiar los textos de la web`;
  }

  return input.title.replace(/^el usuario\s+/i, "").trim();
}

export function proposalDisplaySummary(input: ProposalCopyInput) {
  const payload = readPayload(input.payload);

  if (input.type === "UPDATE_SITE_COPY") {
    const siteCopy = readPayload(payload.siteCopy);
    return clean(siteCopy.loginHeroTitle) ?? input.summary;
  }

  if (input.type === "ADD_IMAGE") {
    return clean(payload.altText) ?? "Foto pendiente de aprobacion.";
  }

  return clean(input.summary) ?? "El grupo decide con votos y comentarios.";
}

function readPayload(payload: unknown): Record<string, string | Record<string, string> | unknown> {
  return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
}

function clean(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
