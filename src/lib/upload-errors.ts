/**
 * Códigos y mensajes de upload para el admin.
 * Los detalles de infraestructura van a logs; la UI solo ve `error`.
 */

export type UploadErrorCode =
  | "R2_NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE"
  | "IMAGE_PROCESS_FAILED"
  | "R2_UPLOAD_FAILED"
  | "MEDIA_REGISTRATION_FAILED"
  | "UNKNOWN_UPLOAD_ERROR";

const UI_MESSAGES: Record<UploadErrorCode, string> = {
  R2_NOT_CONFIGURED: "El almacenamiento de archivos no está configurado.",
  UNAUTHORIZED:
    "Tu sesión no permite realizar esta acción. Volvé a iniciar sesión.",
  FORBIDDEN:
    "Tu sesión no permite realizar esta acción. Volvé a iniciar sesión.",
  INVALID_FILE: "No se pudo leer el archivo seleccionado.",
  FILE_TOO_LARGE:
    "No se pudo subir: el archivo supera el tamaño máximo permitido.",
  UNSUPPORTED_FILE: "No se pudo subir: este formato no está permitido.",
  IMAGE_PROCESS_FAILED:
    "No se pudo procesar la imagen. Probá con otro archivo.",
  R2_UPLOAD_FAILED: "No se pudo subir el archivo al almacenamiento.",
  MEDIA_REGISTRATION_FAILED:
    "El archivo se subió, pero no se pudo registrar correctamente.",
  UNKNOWN_UPLOAD_ERROR: "No se pudo subir el archivo.",
};

export function uploadErrorMessage(code: UploadErrorCode): string {
  return UI_MESSAGES[code];
}

export function failUpload(code: UploadErrorCode): {
  ok: false;
  code: UploadErrorCode;
  error: string;
} {
  return { ok: false, code, error: uploadErrorMessage(code) };
}

export type UploadLogContext = {
  operation: string;
  bucket?: string;
  key?: string;
  path?: string;
  mime?: string | null;
  byteSize?: number | null;
  folder?: string;
};

/** Extrae metadata segura de errores (p.ej. AWS SDK). Sin secretos. */
export function summarizeUnknownError(err: unknown): {
  name: string;
  message: string;
  code?: string | number;
  httpStatusCode?: number;
  requestId?: string;
} {
  if (err instanceof Error) {
    const anyErr = err as Error & {
      code?: string | number;
      Code?: string | number;
      $metadata?: { httpStatusCode?: number; requestId?: string };
    };
    return {
      name: err.name || "Error",
      message: err.message || "unknown",
      code: anyErr.Code ?? anyErr.code,
      httpStatusCode: anyErr.$metadata?.httpStatusCode,
      requestId: anyErr.$metadata?.requestId,
    };
  }
  return { name: "NonError", message: String(err) };
}

export function logUploadFailure(
  context: UploadLogContext,
  err: unknown,
): void {
  const summary = summarizeUnknownError(err);
  console.error("[admin-upload]", {
    ...context,
    // Nunca loguear keys/secretos/cookies; solo metadata segura del fallo.
    errorName: summary.name,
    errorMessage: summary.message,
    errorCode: summary.code,
    httpStatusCode: summary.httpStatusCode,
    requestId: summary.requestId,
  });
}

export function logUploadEvent(
  level: "info" | "warn",
  context: UploadLogContext & { code?: UploadErrorCode },
): void {
  const payload = { ...context };
  if (level === "warn") {
    console.warn("[admin-upload]", payload);
  } else {
    console.info("[admin-upload]", payload);
  }
}
