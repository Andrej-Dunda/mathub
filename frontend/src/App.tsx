import './global.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'
import Homepage from './pages/Homepage';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import LoginPage from './pages/LoginPage';
import Registration from './pages/Registration';
import ForgottenPassword from './pages/ForgottenPassword';
import useToken from './utils/useToken'
import { useState, createContext, useEffect } from "react";
import React from 'react';
import axios from 'axios';
import MyBlog from './pages/MyBlog';

interface iUser {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  profile_picture: string,
  registration_date: string
}

export const UserContext = createContext<iUser>({
  id: 0,
  email: '',
  first_name: '',
  last_name: '',
  profile_picture: 'profile-picture-default.png',
  registration_date: '2000-01-01T00:00:00'
})

const App = () => {
  const { token, removeToken, setToken } = useToken();
  const userLocalData = localStorage.getItem('userData')
  const [user, setUser] = useState(userLocalData ? JSON.parse(userLocalData) : {
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
    <UserContext.Provider value={user}>
      <Router>
        {!token && token !== "" && token !== undefined ? (
          <Routes>
            <Route path="/">
              <Route index element={<LoginPage setToken={setToken} setUser={setUser} />} />
              <Route path="registration" element={<Registration />} />
              <Route path="forgotten-password" element={<ForgottenPassword />} />
              <Route path="*" element={<LoginPage />} />
            </Route>
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Layout removeToken={removeToken} />}>
              <Route index element={<Homepage />} />
              <Route path="user-profile" element={<UserProfile removeToken={removeToken} updateUser={updateUser} />} />
              <Route path="friends" element={<Friends />} />
              <Route path="my-blog" element={<MyBlog />} />
              <Route path="*" element={<Homepage />} />
            </Route>
          </Routes>
        )}
      </Router>
    </UserContext.Provider>
  );
}

export default App;
