import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface iUser {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  profile_picture: string,
  registration_date: string
}

interface iUserContext {
  user: iUser;
  updateUser: () => void;
  setUser: React.Dispatch<React.SetStateAction<iUser>>;
}

export const UserContext = createContext<iUserContext | null>(null)

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const userLocalData = localStorage.getItem('userData')
  const [user, setUser] = useState<iUser>(userLocalData ? JSON.parse(userLocalData) : {
    id: 0,
    email: 'NaN',
    first_name: '',
    last_name: '',
    profile_picture: 'profile-picture-default.png',
    registration_date: '2000-01-01T00:00:00'
  });
  
  useEffect(() => {
    // Load user data from local storage when the component mounts
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user])
  
  const updateUser = () => {
    axios.get(`/user/${user.id}`)
      .then((res: any) => {
        setUser({
          id: res.data.user[0],
          email: res.data.user[1],
          first_name: res.data.user[2],
          last_name: res.data.user[3],
          profile_picture: res.data.user[4],
          registration_date: res.data.user[5]
        })
      })
      .catch((err) => console.error(err))
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
