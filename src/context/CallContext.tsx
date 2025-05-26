import { createContext, useContext, useState } from 'react';

type CallContextType = {
  refreshCall: boolean;
  setRefreshCall: (value: boolean) => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshCall, setRefreshCall] = useState(false);

  return (
    <CallContext.Provider value={{ refreshCall, setRefreshCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("CallContext must be used within a GlobalProvider");
  return context;
};
