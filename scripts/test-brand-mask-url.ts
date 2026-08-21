/**
 * Smoke tests for mask URL normalization (no network).
 * npx tsx scripts/test-brand-mask-url.ts
 */
import assert from "node:assert/strict";
import { toSameOriginAssetPath } from "../src/lib/brand-assets";

assert.equal(
  toSameOriginAssetPath("/assets/grafico/logos/concitar.svg"),
  "/assets/grafico/logos/concitar.svg",
);

assert.equal(
  toSameOriginAssetPath(
    "https://pub-example.r2.dev/assets/grafico/logos/concitar.svg",
  ),
  "/assets/grafico/logos/concitar.svg",
);

assert.equal(
  toSameOriginAssetPath(
    "https://cdn.example.com/assets/inicio/brand/arrow-right.svg?v=1",
  ),
  "/assets/inicio/brand/arrow-right.svg?v=1",
);

assert.equal(
  toSameOriginAssetPath("https://cdn.example.com/other/file.svg"),
  "https://cdn.example.com/other/file.svg",
);

console.log("OK toSameOriginAssetPath");
