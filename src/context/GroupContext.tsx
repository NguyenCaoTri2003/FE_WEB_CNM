import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from 'config/api';

interface Group {
  email: string;
  groupId: string;
  name: string;
  avatar: string; 
}

interface GroupResponse {
  success: boolean;
  data: Group[];
  message?: string;
}

interface GroupContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  fetchGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<GroupResponse>(API_ENDPOINTS.getGroups, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setGroups(response.data.data);
      } else {
        console.error('Error fetching groups:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <GroupContext.Provider value={{ groups, setGroups, fetchGroups }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupContext must be used within a GroupProvider');
  }
  return context;
};
