import { Outlet } from "react-router-dom";
import './Layout.scss'
import Navigation from "../../components/layout-components/navigation/Navigation";

const Layout = (props: any) => {

  return (
    <div className="layout">
      <Navigation className='nav' removeToken={props.removeToken} />
      <Outlet/>
    </div>
  )
}
export default Layout;