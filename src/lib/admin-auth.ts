import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDataSource } from "@/db/data-source";
import { AdminUserEntity, type AdminUserRow } from "@/db/entities";

const COOKIE = "portfolio_admin_session";
const SESSION_TTL = "7d";

export type AdminSession = {
  userId: number;
  username: string;
  mustChangePassword: boolean;
};

function secretKey() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-me-portfolio-admin";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSessionToken(session: AdminSession) {
  return new SignJWT({
    userId: session.userId,
    username: session.username,
    mustChangePassword: session.mustChangePassword,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

export async function readSessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.userId !== "number" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: AdminSession) {
  const token = await createSessionToken(session);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function findAdminByUsername(
  username: string,
): Promise<AdminUserRow | null> {
  const ds = await getDataSource();
  return ds.getRepository(AdminUserEntity).findOneBy({ username });
}

export async function updateAdminPassword(
  userId: number,
  password: string,
) {
  const ds = await getDataSource();
  await ds.getRepository(AdminUserEntity).update(
    { id: userId },
    {
      passwordHash: await hashPassword(password),
      mustChangePassword: false,
    },
  );
}

export { COOKIE as ADMIN_SESSION_COOKIE };
