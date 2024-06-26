import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import httpClient from '../utils/httpClient';
import { iUser } from '../interfaces/user-interface';
import { useAuth } from './AuthProvider';

interface iUserContext {
  user: iUser;
  updateUser: () => void;
  setUser: React.Dispatch<React.SetStateAction<iUser>>;
}

export const UserContext = createContext<iUserContext | null>(null)

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState<iUser>({
    _id: '',
    user_email: '',
    first_name: '',
    last_name: '',
    profile_picture: 'profile-picture-default.png',
    registration_date: '2000-01-01T00:00:00'
  });

  useEffect(() => {
    updateUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  const updateUser = () => {
    isLoggedIn && httpClient.get('/api/authentication/me')
      .then((res: any) => {
        setUser(res.data)
      })
      .catch((err) => {
        logout()
      })
  }

  return (
    <UserContext.Provider value={{ user, updateUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const currentContext = useContext(UserContext);

  if (!currentContext) {
    throw new Error('useUserData must be used within UserDataProvider!');
  }

  return currentContext;
};
