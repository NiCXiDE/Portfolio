/**
 * Next standalone + serverExternalPackages: copy mysql2/typeorm/sharp (and
 * their dependency trees) into .next/standalone/node_modules.
 */
const fs = require("fs");
const path = require("path");

const srcRoot = path.join(process.cwd(), "node_modules");
const destRoot = path.join(process.cwd(), ".next/standalone/node_modules");
fs.mkdirSync(destRoot, { recursive: true });

function copyPkg(name) {
  const src = path.join(srcRoot, ...name.split("/"));
  const dest = path.join(destRoot, ...name.split("/"));
  if (!fs.existsSync(src) || fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(src, "package.json"), "utf8"));
  } catch {
    return;
  }
  for (const dep of Object.keys(pkg.dependencies || {})) {
    copyPkg(dep);
  }
}

for (const name of [
  "mysql2",
  "typeorm",
  "reflect-metadata",
  "sharp",
  "bcryptjs",
]) {
  copyPkg(name);
}

if (!fs.existsSync(path.join(destRoot, "mysql2"))) {
  console.error("mysql2 was not copied into standalone/node_modules");
  process.exit(1);
}

console.log("Copied external server packages into standalone/node_modules");
