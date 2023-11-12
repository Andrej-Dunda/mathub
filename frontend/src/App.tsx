import './App.scss';
import './global.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'
import Homepage from './pages/Homepage';
import Blogs from './pages/Blogs';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
// import NoPage from './pages/NoPage';
import LoginPage from './pages/LoginPage';
import Registration from './pages/Registration';
import ForgottenPassword from './pages/ForgottenPassword';
import useToken from './utils/useToken'
import NoPage from './pages/NoPage';
import { useState, createContext, useEffect } from "react";
import React from 'react';
import Habits from './pages/Habits';

interface iUser {
  id: number,
  email: string,
  password: string
}

export const UserContext = createContext<iUser>({
  id: 0,
  email: 'NaN',
  password: 'NaN'
})

const App = () => {
  const { token, removeToken, setToken } = useToken();
  const userLocalData = localStorage.getItem('userData')
  const [user, setUser] = useState(userLocalData ? JSON.parse(userLocalData) : {
    id: 0,
    email: 'NaN',
    password: 'NaN'
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

  return (
    <UserContext.Provider value={user}>
      <Router>
        {!token && token !== "" && token !== undefined ? (
          <Routes>
            <Route path="/">
              <Route index element={<LoginPage setToken={setToken} setUser={setUser} />} />
              <Route path="registration" element={<Registration />} />
              <Route path="forgotten-password" element={<ForgottenPassword />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Layout removeToken={removeToken} />}>
              <Route index element={<Homepage token={token} setToken={setToken} />} />
              <Route path="habits" element={<Habits />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="user-profile" element={<UserProfile />} />
              <Route path="friends" element={<Friends />} />
            </Route>
          </Routes>
        )}
      </Router>
    </UserContext.Provider>
  );
}

export default App;
