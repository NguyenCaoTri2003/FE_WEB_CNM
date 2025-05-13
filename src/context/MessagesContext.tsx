// import React, { createContext, useContext, useState } from "react";

// // Tạo context
// const MessageContext = createContext<any>(null);

// // Provider để bao quanh các component cần truy cập state
// export const MessagesContext = ({ children }: { children: React.ReactNode }) => {
//   const [lastMessage, setLastMessage] = useState<string | null>(null);
//   const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

//   // Hàm để cập nhật tin nhắn cuối
//   const updateLastMessage = (message: string, time: Date) => {
//     setLastMessage(message);
//     setLastMessageTime(time);
//   };

//   return (
//     <MessageContext.Provider value={{ lastMessage, lastMessageTime, updateLastMessage }}>
//       {children}
//     </MessageContext.Provider>
//   );
// };

// // Hook để sử dụng context ở bất kỳ đâu
// export const useMessageContext = () => {
//   return useContext(MessageContext);
// };
import React, { createContext, useContext, useState } from "react";

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
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessageData>>(() => {
    const stored = localStorage.getItem("lastMessages");
    return stored ? JSON.parse(stored) : {};
  });

 

  const updateLastMessage = (id: string, message: string, time: Date, senderEmail: string) => {
    const newData = {
      ...lastMessages,
      [id]: { message, time, senderEmail},
    };
    setLastMessages(newData);
    localStorage.setItem("lastMessages", JSON.stringify(newData));
  };

  return (
    <MessageContext.Provider value={{ lastMessages, updateLastMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);
