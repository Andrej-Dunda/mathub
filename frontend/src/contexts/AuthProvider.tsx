import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import React from 'react';
import httpClient from '../utils/httpClient';
import { useNav } from './NavigationProvider';
import { useSnackbar } from './SnackbarProvider';

type AuthContextType = {
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
    isLoggedIn && updateIsLoggedIn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  const updateIsLoggedIn: () => Promise<boolean> = () => {
    return httpClient.get('/api/auth-status')
    .then((response: any) => {
      if (!response.data.isLoggedIn) {
        logout()
        if (response.data.reason === 'User self logged out') openSnackbar('Odhlášení proběhlo úspěšně!')
        else if (response.data.reason === 'Session expired') openSnackbar('Byli jste odhlášeni z důvodu neaktivity!')
        return false
      } else {
        setIsLoggedIn(response.data.isLoggedIn)
        return true
      }
    })
    .catch((error: any) => {
      console.error(error)
      logout()
      return false
    });
  }

  const logout = (selfLogout?: boolean) => {
    httpClient.post('/api/logout', { self_logout: selfLogout ? selfLogout : false })
      .then((response: any) => {
        if (response.status === 200) {
          setIsLoggedIn(false)
          toLogin()
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
