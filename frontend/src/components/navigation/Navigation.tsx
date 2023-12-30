import React, { useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Navigation.scss'
import axios from "axios";
import ProfilePicture from '../profile-picture/ProfilePicture';
import { UserContext } from '../../App';

const Navigation = (props: any) => {
  const userInfo = useContext(UserContext)
  const navigate = useNavigate();

  const logout = () => {
    axios({
      method: "POST",
      url: "/logout",
    })
      .then((response) => {
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

  return (
    <nav className="navigation">
        <div className="navbar-left">
          <img className='mathub-logo' src="/logo" alt="" onClick={home} />
          <h1 className="navbar-heading link" onClick={home}>MatHub</h1>
          <Link to='' className="link" aria-current="page">Domů</Link>
          <Link to='friends' className="link">Přátelé</Link>
          <Link to='my-blog' className="link">Můj Blog</Link>
          <Link to='my-subjects' className="link">Moje předměty</Link>
        </div>
        <div className="navbar-right">
          <Link to='' className="logout" onClick={logout}>Odhlásit se</Link>
          <ProfilePicture className='small radius-100 border-white border-hover-gray profile-badge' userId={userInfo.id} onClick={userProfile} />
        </div>
    </nav>
  )
}
export default Navigation;