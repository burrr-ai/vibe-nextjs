"use client";

import { ComwitProvider } from "comwit";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export type AppContext = {
  router: { push: (href: string) => void };
};

export function StateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <ComwitProvider
      context={{ router }}
      defaultOptions={{
        query: {
          staleTime: 30_000,
          cacheTime: 120_000,
          gcTime: 180_000,
        },
      }}
    >
      {children}
    </ComwitProvider>
  );
}
