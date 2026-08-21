/**
 * Pruebas locales de errores controlados de upload (sin PutObject / sin credenciales).
 * Ejecutar: npx tsx scripts/test-upload-errors.ts
 */
import assert from "node:assert/strict";
import {
  prepareUploadFile,
  uploadPreparedToR2,
  UPLOAD_MAX_BYTES,
} from "../src/lib/media-upload";
import { failUpload, uploadErrorMessage } from "../src/lib/upload-errors";

function fakeFile(
  name: string,
  type: string,
  size: number,
  content = "x",
): File {
  const parts: BlobPart[] =
    size <= content.length
      ? [content.slice(0, Math.max(size, 0))]
      : [Buffer.alloc(size, 0x41)];
  return new File(parts, name, { type });
}

async function caseA_r2Absent() {
  const file = fakeFile("cv.pdf", "application/pdf", 128, "%PDF-1.4 test");
  const prepared = await prepareUploadFile(file, "assets/cv");
  assert.equal(prepared.ok, true);
  if (!prepared.ok) return;

  // Sin R2_* de escritura: isR2Configured() es false en este entorno.
  const result = await uploadPreparedToR2(prepared.prepared);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "R2_NOT_CONFIGURED");
  assert.equal(result.error, uploadErrorMessage("R2_NOT_CONFIGURED"));
  assert.equal(result.error.includes("R2_ACCOUNT_ID"), false);
  console.log("OK Caso A — R2_NOT_CONFIGURED");
}

async function caseB_tooLarge() {
  const file = fakeFile("big.pdf", "application/pdf", UPLOAD_MAX_BYTES + 1);
  const result = await prepareUploadFile(file, "assets/cv");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "FILE_TOO_LARGE");
  assert.equal(result.error, uploadErrorMessage("FILE_TOO_LARGE"));
  console.log("OK Caso B — FILE_TOO_LARGE");
}

async function caseC_unsupported() {
  const file = fakeFile("notes.exe", "application/octet-stream", 64);
  const result = await prepareUploadFile(file, "assets/uploads");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "UNSUPPORTED_FILE");
  assert.equal(result.error, uploadErrorMessage("UNSUPPORTED_FILE"));
  console.log("OK Caso C — UNSUPPORTED_FILE");
}

function caseD_authMapping() {
  // requireAdmin lanza Error("UNAUTHORIZED"|"FORBIDDEN"); uploadLocalAsset los mapea.
  const u = failUpload("UNAUTHORIZED");
  const f = failUpload("FORBIDDEN");
  assert.equal(u.code, "UNAUTHORIZED");
  assert.equal(f.code, "FORBIDDEN");
  assert.equal(u.error, f.error);
  assert.match(u.error, /sesión/i);
  assert.notEqual(u.code, "UNKNOWN_UPLOAD_ERROR");
  console.log("OK Caso D — auth codes mapeados (sin UNKNOWN)");
}

async function main() {
  await caseA_r2Absent();
  await caseB_tooLarge();
  await caseC_unsupported();
  caseD_authMapping();
  console.log("\nTodas las pruebas de upload-errors OK.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
