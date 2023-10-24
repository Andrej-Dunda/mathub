import './App.scss';
import './global.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'
import Homepage from './pages/Homepage';
import Blogs from './pages/Blogs';
import UserProfile from './pages/UserProfile';
import Users from './pages/Users';
import NoPage from './pages/NoPage';
import LoginPage from './pages/LoginPage';
import Registration from './pages/Registration';
import ForgottenPassword from './pages/ForgottenPassword';
import useToken from './utils/useToken'

const App = () => {
  const { token, removeToken, setToken } = useToken();

  return (
    <Router>
      <Routes>
        {!token && token!=="" &&token!== undefined? (
          <Route path="/login" element={<LoginPage setToken={setToken}/>} />
        ) : (
          <Route path="/" element={<Layout removeToken={removeToken} />}>
            <Route index element={<Homepage token={token} setToken={setToken} />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="user-profile" element={<UserProfile token={token} setToken={setToken} />} />
            <Route path="users" element={<Users />} />
          </Route>
        )}
        <Route path="/registration" element={<Registration />} />
        <Route path="/forgotten-password" element={<ForgottenPassword />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
