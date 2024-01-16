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
          id: res.data.id,
          email: res.data.email,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          profile_picture: res.data.profile_picture,
          registration_date: res.data.registration_date
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
