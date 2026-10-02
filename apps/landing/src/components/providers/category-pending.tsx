"use client";

import { createContext, useCallback, useContext, useTransition } from "react";

const CategoryPendingContext = createContext<{
  isPending: boolean;
  startNavigation: (fn: () => void) => void;
}>({ isPending: false, startNavigation: (fn) => fn() });

export function CategoryPendingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  const startNavigation = useCallback(
    (fn: () => void) => {
      startTransition(fn);
    },
    [startTransition]
  );

  return (
    <CategoryPendingContext.Provider value={{ isPending, startNavigation }}>
      {children}
    </CategoryPendingContext.Provider>
  );
}

export function useCategoryPending() {
  return useContext(CategoryPendingContext);
}
