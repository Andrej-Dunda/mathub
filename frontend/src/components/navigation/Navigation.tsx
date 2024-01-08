import './Navigation.scss'
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import ProfileBadge from "../profile-badge/ProfileBadge";
import { useNav } from "../../contexts/NavigationProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faHome, faPen, faUserFriends } from '@fortawesome/free-solid-svg-icons';

const Navigation = (props: any) => {
  const { toHome, toFriends, toBlog, toSubjects, activeLink } = useNav()
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  return (
    <nav className="navigation">
        <div className="navbar-left">
          <div className="logo-and-title">
            <MatHubLogo color={grayscale100} onClick={toHome} className='mathub-logo' />
            <h1 className="mathub-title" onClick={toHome}>MatHub</h1>
          </div>
        </div>
        <div className="navbar-middle">
          <div onClick={toHome} className={`link ${activeLink === 'home' ? 'active' : ''}`}>
            <FontAwesomeIcon className='nav-icon' icon={faHome} color={grayscale100} />
          </div>
          <div onClick={toFriends} className={`link ${activeLink === 'friends' ? 'active' : ''}`}>
            <FontAwesomeIcon className='nav-icon' icon={faUserFriends} color={grayscale100} />
          </div>
          <div onClick={toBlog} className={`link ${activeLink === 'blog' ? 'active' : ''}`}>
            <FontAwesomeIcon className='nav-icon' icon={faPen} color={grayscale100} />
          </div>
          <div onClick={toSubjects} className={`link ${activeLink === 'subjects' ? 'active' : ''}`}>
            <FontAwesomeIcon className='nav-icon' icon={faFolderOpen} color={grayscale100} />
          </div>
        </div>
        <div className="navbar-right">
          <ProfileBadge removeToken={props.removeToken} />
        </div>
    </nav>
  )
}
export default Navigation;