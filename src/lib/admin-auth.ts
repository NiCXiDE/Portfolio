import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDataSource } from "@/db/data-source";
import { AdminUserEntity, type AdminUserRow } from "@/db/entities";

const COOKIE = "portfolio_admin_session";
const SESSION_TTL = "7d";
const GUEST_SESSION_TTL = "24h";
const GUEST_MAX_AGE = 60 * 60 * 24;

export type AdminRole = "admin" | "guest";

export type AdminSession = {
  userId: number;
  username: string;
  mustChangePassword: boolean;
  role: AdminRole;
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
  const ttl = session.role === "guest" ? GUEST_SESSION_TTL : SESSION_TTL;
  return new SignJWT({
    userId: session.userId,
    username: session.username,
    mustChangePassword: session.mustChangePassword,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
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
    const role: AdminRole =
      payload.role === "guest" ? "guest" : "admin";
    return {
      userId: payload.userId,
      username: payload.username,
      mustChangePassword: Boolean(payload.mustChangePassword),
      role,
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
    maxAge: session.role === "guest" ? GUEST_MAX_AGE : 60 * 60 * 24 * 7,
  });
}

export async function setGuestSessionCookie() {
  await setSessionCookie({
    userId: 0,
    username: "visitante",
    mustChangePassword: false,
    role: "guest",
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

/** Session required and must be a real admin (not guest showcase). */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}

export function isGuestSession(session: AdminSession | null | undefined) {
  return session?.role === "guest";
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
