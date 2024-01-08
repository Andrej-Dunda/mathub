import './global.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/layout/Layout'
import Homepage from './pages/homepage/Homepage';
import UserProfile from './pages/user-profile/UserProfile';
import Friends from './pages/friends/Friends';
import LoginPage from './pages/login/Login';
import Registration from './pages/registration/Registration';
import ForgottenPassword from './pages/forgotten-password/ForgottenPassword';
import MyBlog from './pages/my-blog/Blog';
import Documentation from './pages/documentation/Documentation';
import MySubjectsWindow from './pages/my-subjects-window/MySubjectsWindow';
import NewBookAnalysis from './pages/new-book-analysis/NewBookAnalysis';
import ViewMaterials from './pages/view-materials/ViewMaterials';
import { useToken } from './contexts/TokenProvider';
import { NavigationProvider } from './contexts/NavigationProvider';

const App = () => {
  const { token, removeToken, setToken } = useToken();
  return (
    <Router>
      <NavigationProvider>
        <Routes>
          <Route path="/documentation" element={<Documentation />} />
          {!token && token !== "" && token !== undefined ? (
            <Route path="/">
              <Route index element={<LoginPage setToken={setToken} />} />
              <Route path="registration" element={<Registration />} />
              <Route path="forgotten-password" element={<ForgottenPassword />} />
              <Route path="*" element={<LoginPage />} />
            </Route>
          ) : (
            <Route path="/" element={<Layout removeToken={removeToken} />}>
              <Route index element={<Homepage />} />
              <Route path="user-profile" element={<UserProfile />} />
              <Route path="friends" element={<Friends />} />
              <Route path="blog" element={<MyBlog />} />
              <Route path="subjects/" element={<MySubjectsWindow />} />
              <Route path="view-materials" element={<ViewMaterials />} />
              <Route path="new-book-analysis" element={<NewBookAnalysis />} />
              <Route path="*" element={<Homepage />} />
            </Route>
          )}
        </Routes>
      </NavigationProvider>
    </Router>
  );
}

export default App;
