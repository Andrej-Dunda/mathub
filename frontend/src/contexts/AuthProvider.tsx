import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import React from 'react';
import httpClient from '../utils/httpClient';
import { useNav } from './NavigationProvider';
import { useSnackbar } from './SnackbarProvider';
import { AxiosInstance } from 'axios';

type AuthContextType = {
  protectedHttpClientInit: () => Promise<AxiosInstance | undefined>;
  updateIsLoggedIn: () => Promise<boolean>;
  logout: (selfLogout?: boolean) => void;
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
  const { toLogin } = useNav();
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    updateIsLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    isLoggedIn && updateIsLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  const updateIsLoggedIn: () => Promise<boolean> = async () => {
    try {
      const response = await httpClient.get('/api/auth-status');
      setIsLoggedIn(response.data.isLoggedIn)
      if (!response.data.isLoggedIn) {
        toLogin()
        if (response.data.reason === 'User self logged out') openSnackbar('Odhlášení proběhlo úspěšně!');
        // else if (response.data.reason === 'Session expired') openSnackbar('Byli jste odhlášeni z důvodu neaktivity!');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      logout();
      return false;
    }
  }

  const logout = (selfLogout?: boolean) => {
    httpClient.post('/api/logout', { self_logout: selfLogout ? selfLogout : false })
      .then((response: any) => {
        if (response.status === 200) {
          updateIsLoggedIn()
        }
      }).catch((error: any) => {
        if (error.response.status === 401) {
          console.error('Logout failed')
        } else {
          console.error(error.response.data)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })
  }

  const protectedHttpClientInit = async () => {
    if(await updateIsLoggedIn()) return httpClient;
  };

  const contextValue = {
    protectedHttpClientInit,
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
