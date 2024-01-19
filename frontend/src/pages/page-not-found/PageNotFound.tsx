import './PageNotFound.scss';
import React from 'react'
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import { useNav } from '../../contexts/NavigationProvider';
import { useAuth } from '../../contexts/AuthProvider';

const PageNotFound = () => {
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toHome } = useNav();
  const { isLoggedIn } = useAuth();

  return (
    <div className={`page-not-found ${isLoggedIn ? 'logged-in' : 'logged-out'}`}>
      <div className="window" onClick={toHome}>
        <MatHubLogo color={grayscale900} className='mathub-logo' />
        <h1 className='title'>404 Stránka nenalezena :(</h1>
      </div>
    </div>
  )
}

export default PageNotFound
