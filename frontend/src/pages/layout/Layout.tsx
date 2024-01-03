import { Outlet } from "react-router-dom";
import './Layout.scss'
import Navigation from "../../components/navigation/Navigation";
import React from "react";
import useToken from "../../utils/useToken";

const Layout = () => {
  const { removeToken } = useToken();

  return (
    <div className="layout">
      <Navigation className='nav' removeToken={removeToken} />
      <Outlet/>
    </div>
  )
}
export default Layout;