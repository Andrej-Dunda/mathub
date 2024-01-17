import { Outlet } from "react-router-dom";
import './Layout.scss'
import Navigation from "../../components/layout-components/navigation/Navigation";

const Layout: React.FC = () => {
  return (
    <div id="layout" className='layout'>
      <Navigation />
      <div className="outlet">
        <Outlet />
      </div>
    </div>
  )
}
export default Layout;