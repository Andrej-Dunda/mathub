import { Link, useNavigate } from "react-router-dom";
import './Navigation.scss'
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import ProfileBadge from "../../profile-badge/ProfileBadge";

const Navigation = (props: any) => {
  const navigate = useNavigate();


  const home = () => navigate('/')
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  return (
    <nav className="navigation">
        <div className="navbar-left">
          <div className="logo-and-title">
            <MatHubLogo color={grayscale100} onClick={home} className='mathub-logo' />
            <h1 className="mathub-title" onClick={home}>MatHub</h1>
          </div>
          <Link to='' className="link" aria-current="page">Domů</Link>
          <Link to='friends' className="link">Přátelé</Link>
          <Link to='my-blog' className="link">Můj Blog</Link>
          <Link to='my-subjects' className="link">Moje předměty</Link>
        </div>
        <div className="navbar-right">
          <ProfileBadge removeToken={props.removeToken} />
        </div>
    </nav>
  )
}
export default Navigation;