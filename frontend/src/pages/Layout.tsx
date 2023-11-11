import { Outlet, Link } from "react-router-dom";
import './Layout.scss'
import Logo from "../images/Logo";
import axios from "axios";

const Layout = (props: any) => {
  const logout = () => {
    axios({
      method: "POST",
      url:"/logout",
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
    })}

  return (
    <div className="layout">
      <header className="layout-header s-green-bg">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid heading-wrapper">
            <a className="navbar-brand logo-wrapper" href="#">
              <img src='./../images/Logo.jpg' alt="" className="logo"/>
            </a>
            <a className="navbar-brand" href="#">Habitator</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Link</a>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Dropdown
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a className="dropdown-item" href="#">Action</a></li>
                    <li><a className="dropdown-item" href="#">Another action</a></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="logo-heading-wrapper">
          <Logo classNames={'logo'} />
          <h1 className="font-32-b habitator-heading">HABITATOR</h1>
        </div>
        <div className="layout-nav">
          <Link to='' className="font-20">HOMEPAGE</Link>
          <Link to='blogs' className="font-20">BLOGS</Link>
          <Link to='user-profile' className="font-20">USER PROFILE</Link>
          <Link to='users' className="font-20">USERS</Link>
          <button onClick={logout}>
            Odhlásit se
          </button>
        </div>
      </header>
      <Outlet/>
    </div>
  )
}
export default Layout;