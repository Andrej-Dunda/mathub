import { Outlet } from "react-router-dom";
import './Layout.scss'
import Navigation from "../../components/navigation/Navigation";
import React from "react";

const Layout = (props: any) => {

  return (
    <div className="layout">
      <Navigation className='nav' removeToken={props.removeToken} />
      <Outlet/>
    </div>
  )
}
export default Layout;