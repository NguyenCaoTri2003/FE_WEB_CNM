import React, { createContext, useContext, useState } from "react";

type GlobalContextType = {
  refreshChat: boolean;
  setRefreshChat: (value: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshChat, setRefreshChat] = useState(false);

  return (
    <GlobalContext.Provider value={{ refreshChat, setRefreshChat }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalContext must be used within a GlobalProvider");
  return context;
};