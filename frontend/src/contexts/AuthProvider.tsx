import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import React from 'react';
import httpClient from '../utils/httpClient';

type AuthContextType = {
  updateIsLoggedIn: () => void;
  logout: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);

  useEffect(() => {
    updateIsLoggedIn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, setIsLoggedIn])

  const updateIsLoggedIn = () => {
    httpClient.get('/auth-status')
    .then((response) => {
      setIsLoggedIn(response.data.isLoggedIn)
      console.log(`Logged in: ${response.data.isLoggedIn}`)
      if (!response.data.isLoggedIn) logout()
    })
    .catch(error => {
      console.error(error)
      logout()
    });
  }

  const logout = () => {
    httpClient.post('/logout')
      .then((response) => {
        if (response.status === 200) setIsLoggedIn(false)
      }).catch((error) => {
        if (error.response.status === 401) {
          console.error('Logout failed')
        } else {
          console.error(error.response.data)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })
  }

  const contextValue = {
    updateIsLoggedIn,
    logout,
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const currentContext = useContext(AuthContext);

  if (!currentContext) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return currentContext;
};
