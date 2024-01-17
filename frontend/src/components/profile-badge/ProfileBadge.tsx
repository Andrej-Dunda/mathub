import { useEffect, useRef, useState } from 'react';
import './ProfileBadge.scss'
import ProfilePicture from '../profile-picture/ProfilePicture';
import { useUserData } from '../../contexts/UserDataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNav } from '../../contexts/NavigationProvider';
import { useAuth } from '../../contexts/AuthProvider';

const ProfileBadge = () => {
  const { user } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const profileBadgeRef = useRef<HTMLImageElement>(null);
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toUserProfile } = useNav();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        profileBadgeRef.current &&
        !profileBadgeRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className="profile-badge"
      ref={profileBadgeRef}
      onClick={toggleMenu}
    >
      <div className="profile-picture-wrapper">
        <ProfilePicture
          className='small radius-100'
          userId={user._id}
        />
      </div>
      {
        isMenuOpen && (
          <div className="popup-menu">
            <div className="menu-item user-profile" onClick={toUserProfile} >
              <FontAwesomeIcon icon={faUser} color={grayscale900} />
              {`${user.first_name} ${user.last_name}`}
            </div>
            <div className="menu-item" onClick={logout} >
              <FontAwesomeIcon icon={faSignOut} color={grayscale900} />
              Odhlásit se
            </div>
          </div>
        )
      }
    </div>
  )
}
export default ProfileBadge;