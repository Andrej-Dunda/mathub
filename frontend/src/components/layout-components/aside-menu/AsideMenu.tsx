import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './AsideMenu.scss'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ReactNode } from 'react';

interface iAsideMenu {
  isAsideMenuOpen: boolean;
  setIsAsideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  children?: ReactNode;

}

const AsideMenu = ({ isAsideMenuOpen, setIsAsideMenuOpen, className, children }: iAsideMenu) => {
  const toggleAsideMenu = () => {
    setIsAsideMenuOpen(!isAsideMenuOpen)
  }

  return (
    <aside className={`aside-menu ${className ? className : ''} ${isAsideMenuOpen ? 'open' : ''}`}>
      <div className="aside-main">
        <div className="aside-main-container">
          {children}
        </div>
      </div>
      <div className="aside-aside">
        <button className="toggle-side-menu-button" onClick={toggleAsideMenu}>
          <FontAwesomeIcon icon={isAsideMenuOpen ? faChevronRight : faChevronLeft} className='toggle-side-menu-icon' />
        </button>
      </div>
    </aside>
  )
}
export default AsideMenu;