"use client";

import { createContext, useContext } from "react";

const AdminGuestContext = createContext(false);

export function AdminGuestProvider({
  isGuest,
  children,
}: {
  isGuest: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminGuestContext.Provider value={isGuest}>
      {children}
    </AdminGuestContext.Provider>
  );
}

export function useIsAdminGuest() {
  return useContext(AdminGuestContext);
}
