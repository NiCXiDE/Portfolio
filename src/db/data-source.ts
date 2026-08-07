import { DataSource } from "typeorm";
import {
  AdminUserEntity,
  BioEntity,
  BrandManualEntity,
  GraphicItemEntity,
  NamedListItemEntity,
  SiteSettingsEntity,
  SocialLinkEntity,
  TagEntity,
  TechIconEntity,
  TestimonialEntity,
  UiListItemEntity,
  UiProjectEntity,
} from "./entities";

export const portfolioEntities = [
  BioEntity,
  NamedListItemEntity,
  TestimonialEntity,
  GraphicItemEntity,
  BrandManualEntity,
  UiProjectEntity,
  UiListItemEntity,
  TechIconEntity,
  AdminUserEntity,
  TagEntity,
  SiteSettingsEntity,
  SocialLinkEntity,
];

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

function connectionOptions() {
  if (process.env.DATABASE_URL) {
    return parseDatabaseUrl(process.env.DATABASE_URL);
  }

  return {
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    username: process.env.DATABASE_USER ?? "portfolio",
    password: process.env.DATABASE_PASSWORD ?? "portfolio",
    database: process.env.DATABASE_NAME ?? "portfolio",
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __portfolioDataSource: DataSource | undefined;
}

export function createDataSource(synchronize = false) {
  const conn = connectionOptions();
  return new DataSource({
    type: "mysql",
    ...conn,
    entities: portfolioEntities,
    synchronize,
    logging: process.env.TYPEORM_LOGGING === "1",
    charset: "utf8mb4",
  });
}

export async function getDataSource(): Promise<DataSource> {
  if (globalThis.__portfolioDataSource?.isInitialized) {
    // Hot-reload: rebuild if entity set changed
    if (
      globalThis.__portfolioDataSource.entityMetadatas.length !==
      portfolioEntities.length
    ) {
      await globalThis.__portfolioDataSource.destroy();
      globalThis.__portfolioDataSource = undefined;
    } else {
      return globalThis.__portfolioDataSource;
    }
  }

  const ds =
    globalThis.__portfolioDataSource ??
    createDataSource(process.env.TYPEORM_SYNC === "1");

  if (!ds.isInitialized) {
    await ds.initialize();
  }

  globalThis.__portfolioDataSource = ds;
  return ds;
}
