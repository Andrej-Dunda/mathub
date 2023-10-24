import { Outlet, Link } from "react-router-dom";
import './Layout.scss'
import Logo from "../images/Logo";

const Layout = (props: any) => {
  return (
    <div className="layout">
      <header className="layout-header s-green-bg">
        <div className="logo-heading-wrapper">
          <Logo classNames={'logo'} />
          <h1 className="font-32-b habitator-heading">HABITATOR</h1>
        </div>
        <div className="layout-nav">
          <Link to='' className="font-20">HOMEPAGE</Link>
          <Link to='blogs' className="font-20">BLOGS</Link>
          <Link to='user-profile' className="font-20">USER PROFILE</Link>
          <Link to='users' className="font-20">USERS</Link>
          <button onClick={props.removeToken()}>
            Odhlásit se
          </button>
        </div>
      </header>
      <Outlet/>
    </div>
  )
}
export default Layout;