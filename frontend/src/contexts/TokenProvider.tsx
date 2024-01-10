import { createContext, useContext, useState, ReactNode } from 'react';

interface iTokenContext {
  token: string | null;
  removeToken: () => void;
  setToken: (userToken: any) => void;
}

export const TokenContext = createContext<iTokenContext | null>(null)

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const getToken = () => {
    const userToken = localStorage.getItem('token');
    return userToken && userToken
  }

  const [token, setToken] = useState<string | null>(getToken());

  const saveToken = (userToken: any) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <TokenContext.Provider value={{ token, removeToken, setToken: saveToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const currentContext = useContext(TokenContext);

  if (!currentContext) {
    throw new Error('useToken must be used within TokenProvider!');
  }

  return currentContext;
};
