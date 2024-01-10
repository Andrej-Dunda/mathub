import { Outlet } from "react-router-dom";
import './Layout.scss'
import Navigation from "../../components/layout-components/navigation/Navigation";

interface iLayout {
  removeToken: () => void;
}

const Layout: React.FC<iLayout> = ({ removeToken }) => {
  return (
    <div id="layout" className='layout'>
      <Navigation className='nav' removeToken={removeToken} />
      <Outlet/>
    </div>
  )
}
export default Layout;