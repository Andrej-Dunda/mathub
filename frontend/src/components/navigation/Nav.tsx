import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import './Nav.scss'
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
        console.log(response.data.msg)
        localStorage.removeItem('userData')
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Habitator</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Link to='' className="nav-link" aria-current="page">Domů</Link>
            <Link to='habits' className="nav-link">Návyky</Link>
            <Link to='blogs' className="nav-link">Blogy</Link>
            <Link to='friends' className="nav-link">Přátelé</Link>
          </div>
        </div>
        <Link to='' className="logout" onClick={logout}>Odhlásit se</Link>
        <a className="profile-badge" href='/user-profile'>
          <ProfilePicture className='small radius-100' userId={userInfo.id} />
        </a>
      </div>
    </nav>
  )
}
export default Nav;