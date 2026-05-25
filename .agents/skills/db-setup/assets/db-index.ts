import "server-only";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

const isDev = process.env.NODE_ENV === "development";
const devStmtMeta = Symbol("dev-d1-stmt-meta");

type DevStmtMeta = {
  query: string;
  boundValues: unknown[];
};

type DevD1PreparedStatement = D1PreparedStatement & {
  [devStmtMeta]?: DevStmtMeta;
};

type TransactionControl = "enter" | "exit" | null;

// Production: standard wiring
const createDb = async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
};

// Development: D1 proxy that auto-reconnects when the session expires
const createDevDb = () => {
  let transactionDepth = 0;

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
      if (transactionDepth > 0) {
        console.warn(
          "[DB] error inside a transaction; skipping reconnect retry",
          error
        );
        throw error;
      }

      console.warn("[DB] session expired, attempting reconnect...", error);
      resetCloudflareContext();
      const result = await fn(await getD1());
      console.warn("[DB] reconnect succeeded");
      return result;
    }
  };

  console.warn(
    "[DB] dev D1 proxy created — auto-reconnects on session expiration"
  );

  const getTransactionControl = (query: string): TransactionControl => {
    const normalized = query.trim().toLowerCase();
    if (normalized.startsWith("begin") || normalized.startsWith("savepoint ")) {
      return "enter";
    }
    if (
      normalized.startsWith("commit") ||
      normalized.startsWith("rollback") ||
      normalized.startsWith("release savepoint ")
    ) {
      return "exit";
    }
    return null;
  };

  const applyTransactionControl = (query: string) => {
    const control = getTransactionControl(query);
    if (control === "enter") {
      transactionDepth += 1;
    } else if (control === "exit") {
      transactionDepth = Math.max(0, transactionDepth - 1);
    }
  };

  const createRealStmt = (
    d1: D1Database,
    statement: D1PreparedStatement
  ): D1PreparedStatement => {
    const meta = (statement as DevD1PreparedStatement)[devStmtMeta];
    if (!meta) return statement;

    const stmt = d1.prepare(meta.query);
    return meta.boundValues.length > 0
      ? stmt.bind(...meta.boundValues)
      : stmt;
  };

  const createStmtProxy = (
    query: string,
    boundValues: unknown[] = []
  ): D1PreparedStatement =>
    new Proxy(
      {
        [devStmtMeta]: { query, boundValues },
      } as DevD1PreparedStatement,
      {
        get: (target, method) => {
          if (method === devStmtMeta) {
            return target[devStmtMeta];
          }
          if (method === "bind") {
            return (...values: unknown[]) => createStmtProxy(query, values);
          }
          if (method === "then") {
            return undefined;
          }
          return (...args: unknown[]) =>
            withRetry(async (d1) => {
              const stmt = createRealStmt(d1, target);
              const result = await (
                stmt as unknown as Record<
                  string | symbol,
                  (...a: unknown[]) => unknown
                >
              )[method](...args);
              applyTransactionControl(query);
              return result;
            });
        },
      },
    );

  const d1Proxy = new Proxy({} as D1Database, {
    get: (_, prop: keyof D1Database) => {
      if (prop === "prepare") {
        return (query: string) => createStmtProxy(query);
      }
      if (prop === "batch") {
        return (statements: D1PreparedStatement[]) =>
          withRetry(async (d1) =>
            d1.batch(
              statements.map((statement) => createRealStmt(d1, statement))
            )
          );
      }
      return (...args: unknown[]) =>
        withRetry(async (d1) =>
          (
            d1 as unknown as Record<string | symbol, (...a: unknown[]) => unknown>
          )[prop](...args)
        );
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
