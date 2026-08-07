import {
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

export function isR2Configured() {
  return r2Configured();
}

function client() {
  if (!r2Configured()) {
    throw new Error("R2_NOT_CONFIGURED");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** Store as public path `/assets/...` in DB */
export function toPublicPath(key: string) {
  const normalized = key.replace(/^\/+/, "");
  return `/${normalized.startsWith("assets/") ? normalized : `assets/${normalized}`}`;
}

export async function uploadToR2(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const key = params.key.replace(/^\/+/, "");
  const s3 = client();
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );
  return toPublicPath(key);
}

export async function listR2Prefix(prefix = "assets/", maxKeys = 100) {
  const s3 = client();
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET!,
      Prefix: prefix.replace(/^\/+/, ""),
      MaxKeys: maxKeys,
    }),
  );
  return (res.Contents ?? []).map((obj) => ({
    key: obj.Key ?? "",
    size: obj.Size ?? 0,
    path: toPublicPath(obj.Key ?? ""),
  }));
}
