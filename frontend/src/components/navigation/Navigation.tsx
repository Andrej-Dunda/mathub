import { Link, useNavigate } from "react-router-dom";
import './Navigation.scss'
import axios from "axios";
import ProfilePicture from '../profile-picture/ProfilePicture';
import { useUserData } from "../../contexts/UserDataProvider";
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';

const Navigation = (props: any) => {
  const { user } = useUserData();
  const navigate = useNavigate();

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

  const home = () => navigate('/')
  const userProfile = () => navigate('/user-profile')
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
          <Link to='' className="logout" onClick={logout}>Odhlásit se</Link>
          <ProfilePicture className='small radius-100 border-white border-hover-gray profile-badge' userId={user.id} onClick={userProfile} />
        </div>
    </nav>
  )
}
export default Navigation;