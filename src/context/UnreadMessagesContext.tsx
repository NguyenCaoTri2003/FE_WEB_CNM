import React, { createContext, useState, useContext, useEffect } from 'react';

const STORAGE_KEY = 'unreadMessages';

type UnreadMessagesContextType = {
  unreadMessages: Set<string>;
  isInitialized: boolean;
  addUnreadMessage: (id: string) => void;
  removeUnreadMessage: (id: string) => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  unreadMessages: new Set(),
  isInitialized: false,
  addUnreadMessage: () => {},
  removeUnreadMessage: () => {}
});

export const UnreadMessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadMessages, setUnreadMessages] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false); // ✅ thêm cờ

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUnreadMessages(new Set(parsed));
      } catch (e) {
        console.error("Không thể parse unreadMessages từ localStorage", e);
      }
    }
    setIsInitialized(true); // ✅ báo hiệu đã load xong
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unreadMessages)));
    }
  }, [unreadMessages, isInitialized]);

  const addUnreadMessage = (id: string) => {
    setUnreadMessages((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const removeUnreadMessage = (id: string) => {
    setUnreadMessages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadMessages, isInitialized, addUnreadMessage, removeUnreadMessage }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);
