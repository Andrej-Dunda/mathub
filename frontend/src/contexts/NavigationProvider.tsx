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
  toMaterials: () => void;
  toViewMaterials: () => void;
  toNewBookAnalysis: () => void;
  toPreviewMaterial: (material_id: string) => void;
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
  const toMaterials = () => {
    navigate('/materials');
    setActiveLink('/materials')
  }
  const toViewMaterials = () => {
    navigate('/view-materials');
    setActiveLink('view-materials')
  }
  const toNewBookAnalysis = () => {
    navigate('/new-book-analysis');
    setActiveLink('/new-book-analysis')
  }

  const toPreviewMaterial = (material_id: string) => {
    navigate(`/preview-material?material_id=${material_id}`);
    setActiveLink('/preview-material')
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
      toMaterials,
      toViewMaterials,
      toNewBookAnalysis,
      toPreviewMaterial,
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
