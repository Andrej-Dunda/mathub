import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import './Navigation.scss'
import axios from "axios";
import ProfilePicture from '../profile-picture/ProfilePicture';
import { UserContext } from '../../App';

const Nav = (props: any) => {
  const userInfo = useContext(UserContext)

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

  return (
    <nav className="navigation">
        <div className="navbar-left">
          <img className='habitator-logo' src="/logo" alt="" />
          <a className="navbar-heading link" href="/">Habitator</a>
          <Link to='' className="link" aria-current="page">Domů</Link>
          <Link to='friends' className="link">Přátelé</Link>
          <Link to='my-blog' className="link">Můj Blog</Link>
          <Link to='my-materials' className="link">Moje materiály</Link>
        </div>
        <div className="navbar-right">
          <Link to='' className="logout" onClick={logout}>Odhlásit se</Link>
          <a className="profile-badge" href='/user-profile'>
            <ProfilePicture className='small radius-100 border-white border-hover-gray' userId={userInfo.id} />
          </a>
        </div>
    </nav>
  )
}
export default Nav;