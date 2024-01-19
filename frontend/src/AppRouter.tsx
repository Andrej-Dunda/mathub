import { Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthProvider'
import Layout from './pages/layout/Layout';
import Homepage from './pages/homepage/Homepage';
import UserProfile from './pages/user-profile/UserProfile';
import Friends from './pages/friends/Friends';
import Blog from './pages/blog/Blog';
import SubjectsWindow from './pages/subjects-window/SubjectsWindow';
import ViewMaterials from './pages/view-materials/ViewMaterials';
import NewBookAnalysis from './pages/new-book-analysis/NewBookAnalysis';
import LoginPage from './pages/login/Login';
import Registration from './pages/registration/Registration';
import ForgottenPassword from './pages/forgotten-password/ForgottenPassword';
import PageNotFound from './pages/page-not-found/PageNotFound';

const AppRouter = () => {
  const { isLoggedIn } = useAuth()

  return (
    <Routes>
      {
        isLoggedIn ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="user-profile" element={<UserProfile />} />
            <Route path="friends" element={<Friends />} />
            <Route path="blog" element={<Blog />} />
            <Route path="subjects" element={<SubjectsWindow />} />
            <Route path="view-materials" element={<ViewMaterials />} />
            <Route path="new-book-analysis" element={<NewBookAnalysis />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        ) : (
          <Route path="/">
            <Route index element={<LoginPage />} />
            <Route path="registration" element={<Registration />} />
            <Route path="forgotten-password" element={<ForgottenPassword />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        )
      }
    </Routes>
  )
}
export default AppRouter;