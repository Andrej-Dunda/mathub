import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface iNavigationContext {
  toLogin: () => void;
  toRegistration: () => void;
  toForgottenPassword: () => void;
  toHome: () => void;
  toMyProfile: () => void;
  toUserProfile: (user_id: string) => void;
  toFriends: () => void;
  toBlog: () => void;
  toSubjects: () => void;
  toViewMaterials: () => void;
  toNewBookAnalysis: () => void;
  activeLink: string;
  setActiveLink: React.Dispatch<React.SetStateAction<string>>;
  toPreviousPage: () => void;
}

export const NavigationContext = createContext<iNavigationContext | null>(null)

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState<string>(localStorage.getItem('activeLink') || '/');

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  const toLogin = () => {
    navigate('/');
    setActiveLink('/')
  }
  const toRegistration = () => {
    navigate('/registration');
    setActiveLink('/registration')
  }
  const toForgottenPassword = () => {
    navigate('/forgotten-password');
    setActiveLink('/forgotten-password')
  }
  
  const toHome = () => {
    navigate('/');
    setActiveLink('/')
  }
  const toMyProfile = () => {
    navigate('/my-profile');
    setActiveLink('/my-profile')
  }
  const toUserProfile = (user_id: string) => {
    navigate(`/user-profile?user_id=${user_id}`);
    setActiveLink('/user-profile')
  }
  const toFriends = () => {
    navigate('/friends');
    setActiveLink('/friends')
  }
  const toBlog = () => {
    navigate('/blog');
    setActiveLink('/blog')
  }
  const toSubjects = () => {
    navigate('/subjects');
    setActiveLink('/subjects')
  }
  const toViewMaterials = () => {
    navigate('/view-materials');
    setActiveLink('view-materials')
  }
  const toNewBookAnalysis = () => {
    navigate('/new-book-analysis');
    setActiveLink('/new-book-analysis')
  }

  const toPreviousPage = () => {
    navigate(activeLink);
  }

  return (
    <NavigationContext.Provider value={{
      toLogin,
      toRegistration,
      toForgottenPassword,
      toHome,
      toMyProfile,
      toUserProfile,
      toFriends,
      toBlog,
      toSubjects,
      toViewMaterials,
      toNewBookAnalysis,
      activeLink,
      setActiveLink,
      toPreviousPage
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
