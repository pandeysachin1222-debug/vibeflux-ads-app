import React from "react";

// Global application state / mock store
export const store = {
  user: null,
  theme: "light",
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default store;
