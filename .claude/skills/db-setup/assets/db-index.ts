import "server-only";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

const isDev = process.env.NODE_ENV === "development";

// 프로덕션: 기존 방식
const createDb = async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
};

// 개발: 세션 만료 시 자동 재연결하는 D1 Proxy
const createDevDb = () => {
  const resetCloudflareContext = () => {
    (globalThis as Record<symbol, unknown>)[
      Symbol.for("__cloudflare-context__")
    ] = undefined;
  };

  const getD1 = async () => {
    const { env } = await getCloudflareContext({ async: true });
    return env.DB;
  };

  const withRetry = async <T>(fn: (d1: D1Database) => Promise<T>): Promise<T> => {
    try {
      return await fn(await getD1());
    } catch (error) {
      console.warn("[DB] 세션 만료 감지, 재연결 시도...", error);
      resetCloudflareContext();
      const result = await fn(await getD1());
      console.warn("[DB] 재연결 성공");
      return result;
    }
  };

  console.warn(
    "[DB] 개발용 D1 Proxy 생성됨 - 세션 만료 시 자동 재연결 지원"
  );

  const createStmtProxy = (
    query: string,
    boundValues: unknown[] = []
  ): D1PreparedStatement =>
    new Proxy({} as D1PreparedStatement, {
      get: (_, method) => {
        if (method === "bind") {
          return (...values: unknown[]) => createStmtProxy(query, values);
        }
        return (...args: unknown[]) =>
          withRetry((d1) => {
            let stmt = d1.prepare(query);
            if (boundValues.length > 0) stmt = stmt.bind(...boundValues);
            return (stmt as any)[method](...args);
          });
      },
    });

  const d1Proxy = new Proxy({} as D1Database, {
    get: (_, prop: keyof D1Database) => {
      if (prop === "prepare") {
        return (query: string) => createStmtProxy(query);
      }
      return (...args: unknown[]) =>
        withRetry((d1) => (d1 as any)[prop](...args));
    },
  });

  return drizzle(d1Proxy, { schema });
};

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = isDev ? createDevDb() : await createDb();
  }
  return dbInstance;
};

export type Database = Awaited<ReturnType<typeof getDb>>;
