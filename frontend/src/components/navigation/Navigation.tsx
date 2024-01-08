import { Link } from "react-router-dom";
import './Navigation.scss'
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import ProfileBadge from "../../profile-badge/ProfileBadge";
import { useNav } from "../../contexts/NavigationProvider";

const Navigation = (props: any) => {
  const { toHome } = useNav()
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
          <Link to='' className="link" aria-current="page">Domů</Link>
          <Link to='friends' className="link">Přátelé</Link>
          <Link to='blog' className="link">Můj Blog</Link>
          <Link to='subjects' className="link">Moje předměty</Link>
        </div>
        <div className="navbar-right">
          <ProfileBadge removeToken={props.removeToken} />
        </div>
    </nav>
  )
}
export default Navigation;