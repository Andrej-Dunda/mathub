import { Outlet } from "react-router-dom";
import './Layout.scss'
import Nav from "../components/navigation/Nav";
import React from "react";

const Layout = (props: any) => {

  return (
    <div className="layout">
      <Nav className='nav' removeToken={props.removeToken} />
      <Outlet/>
    </div>
  )
}
export default Layout;