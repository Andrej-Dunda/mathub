import React from "react";
import './UserBadge.scss'
import DefaultProfilePicture from "../../images/DefaultProfilePicture";
import { useNavigate } from "react-router-dom";

const UserBadge = () => {
  const navigate = useNavigate()
  const userProfile = () => {
    navigate('/user-profile')
  }
  
  return (
    <button type="button" onClick={userProfile} className="nav-link" >
      <DefaultProfilePicture />
    </button>
  )
}
export default UserBadge;