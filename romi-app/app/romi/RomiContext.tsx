"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRomiState, type Romi } from "./useRomiState";

const RomiContext = createContext<Romi | null>(null);

export function RomiProvider({ children }: { children: ReactNode }) {
  const romi = useRomiState();
  return <RomiContext.Provider value={romi}>{children}</RomiContext.Provider>;
}

export function useRomi() {
  const romi = useContext(RomiContext);
  if (!romi) throw new Error("useRomi must be used inside <RomiProvider>");
  return romi;
}
