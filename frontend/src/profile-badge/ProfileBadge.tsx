import { useEffect, useRef, useState } from 'react';
import './ProfileBadge.scss'
import ProfilePicture from '../components/profile-picture/ProfilePicture';
import { useUserData } from '../contexts/UserDataProvider';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNav } from '../contexts/NavigationProvider';

const ProfileBadge = (props: any) => {
  const { user } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const profileBadgeRef = useRef<HTMLImageElement>(null);
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toUserProfile } = useNav();
  
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
  
  const logout = () => {
    axios({
      method: "POST",
      url: "/logout",
    })
      .then(() => {
        props.removeToken()
        localStorage.removeItem('userData')
      }).catch((error) => {
        if (error.response) {
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })
  }

  return (
    <div
      className="profile-badge"
      ref={profileBadgeRef}
      onClick={toggleMenu}
    >
      <ProfilePicture
        className='small radius-100'
        userId={user.id}
      />
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