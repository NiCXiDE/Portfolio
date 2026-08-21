/**
 * Smoke: upload-rules stay aligned with media-upload limits.
 * npx tsx scripts/test-upload-rules.ts
 */
import assert from "node:assert/strict";
import {
  UPLOAD_MAX_BYTES,
  isAllowedUploadFile,
  preflightUploadFile,
  uploadRuleHint,
} from "../src/lib/upload-rules";

assert.equal(UPLOAD_MAX_BYTES, 20 * 1024 * 1024);

assert.equal(
  preflightUploadFile(
    { name: "x.pdf", type: "application/pdf", size: 10 },
    "pdf",
  ),
  null,
);
assert.equal(
  preflightUploadFile(
    { name: "x.png", type: "image/png", size: UPLOAD_MAX_BYTES + 1 },
    "image",
  ),
  "FILE_TOO_LARGE",
);
assert.equal(
  preflightUploadFile(
    { name: "x.exe", type: "application/octet-stream", size: 10 },
    "image",
  ),
  "UNSUPPORTED_FILE",
);
assert.ok(isAllowedUploadFile({ name: "a.svg", type: "", size: 1 }, "logo"));
assert.match(uploadRuleHint("logo").summary, /SVG/);
assert.match(uploadRuleHint("logo").summary, /Máx\. 20 MB/);
assert.ok(uploadRuleHint("logo").note);

console.log("OK upload-rules");
