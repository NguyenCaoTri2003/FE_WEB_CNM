
import React, { createContext, useContext, useEffect, useState } from "react";

type LastMessageData = {
  message: string;
  time: Date;
  senderEmail: string;  
};


type MessageContextType = {
  lastMessages: Record<string, LastMessageData>;
  updateLastMessage: (id: string, message: string, time: Date, senderEmail: string) => void;
};

const MessageContext = createContext<MessageContextType | null>(null);

export const MessagesContext = ({ children }: { children: React.ReactNode }) => {
  // const [lastMessages, setLastMessages] = useState<Record<string, LastMessageData>>(() => {
  //   const user = JSON.parse(localStorage.getItem("user") || "{}");
  //   const currentUserEmail = user.email;
  //   const stored = localStorage.getItem(`lastMessages_${currentUserEmail}`);
  //   return stored ? JSON.parse(stored) : {};
  // });

  const [lastMessages, setLastMessages] = useState<Record<string, LastMessageData>>({});
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserEmail = user.email;
    const stored = localStorage.getItem(`lastMessages_${currentUserEmail}`);
    if (stored) {
      setLastMessages(JSON.parse(stored));
    }
  }, []);

 

  const updateLastMessage = (id: string, message: string, time: Date, senderEmail: string) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserEmail = user.email;
      const key = `lastMessages_${currentUserEmail}`;
      const existing = JSON.parse(localStorage.getItem(key) || "{}");
      const currentLast = existing[id];
      console.log("currentLast", currentLast);
      
      const newData = {
        ...existing,
        [id]: { message, time, senderEmail },
      };

      localStorage.setItem(key, JSON.stringify(newData));
      setLastMessages(newData);
      
  };

  useEffect(() => {
    console.log("✅ Last messages đã cập nhật: ", lastMessages);
  }, [lastMessages]);
  
  
  return (
    <MessageContext.Provider value={{ lastMessages, updateLastMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);
