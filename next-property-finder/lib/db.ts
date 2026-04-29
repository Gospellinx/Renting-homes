import postgres from "postgres";
import { getEnv } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __propertyFinderDb__: ReturnType<typeof postgres> | undefined;
}

export function getDb() {
  if (!globalThis.__propertyFinderDb__) {
    globalThis.__propertyFinderDb__ = postgres(getEnv().DATABASE_URL, {
      max: 1,
      prepare: false,
      idle_timeout: 10,
      connect_timeout: 15,
    });
  }

  return globalThis.__propertyFinderDb__;
}
