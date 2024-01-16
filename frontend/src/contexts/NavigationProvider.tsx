import { createContext, useContext, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface iNavigationContext {
  toLogin: () => void;
  toRegistration: () => void;
  toForgottenPassword: () => void;
  toHome: () => void;
  toUserProfile: () => void;
  toFriends: () => void;
  toBlog: () => void;
  toSubjects: () => void;
  toViewMaterials: () => void;
  toNewBookAnalysis: () => void;
  activeLink: string;
  setActiveLink: React.Dispatch<React.SetStateAction<string>>;
}

export const NavigationContext = createContext<iNavigationContext | null>(null)

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState<string>('');

  const toLogin = () => {
    navigate('/');
    setActiveLink('login')
  }
  const toRegistration = () => {
    navigate('/registration');
    setActiveLink('registration')
  }
  const toForgottenPassword = () => {
    navigate('/forgotten-password');
    setActiveLink('forgotten-password')
  }
  
  const toHome = () => {
    navigate('/');
    setActiveLink('home')
  }
  const toUserProfile = () => {
    navigate('/user-profile');
    setActiveLink('user-profile')
  }
  const toFriends = () => {
    navigate('/friends');
    setActiveLink('friends')
  }
  const toBlog = () => {
    navigate('/blog');
    setActiveLink('blog')
  }
  const toSubjects = () => {
    navigate('/subjects');
    setActiveLink('subjects')
  }
  const toViewMaterials = () => {
    navigate('/view-materials');
    setActiveLink('view-materials')
  }
  const toNewBookAnalysis = () => {
    navigate('/new-book-analysis');
    setActiveLink('new-book-analysis')
  }

  return (
    <NavigationContext.Provider value={{
      toLogin,
      toRegistration,
      toForgottenPassword,
      toHome,
      toUserProfile,
      toFriends,
      toBlog,
      toSubjects,
      toViewMaterials,
      toNewBookAnalysis,
      activeLink,
      setActiveLink
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNav = () => {
  const currentContext = useContext(NavigationContext);

  if (!currentContext) {
    throw new Error('useNav must be used within NavigationProvider!');
  }

  return currentContext;
};
