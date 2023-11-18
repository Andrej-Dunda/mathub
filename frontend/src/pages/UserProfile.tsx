import './UserProfile.scss'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../App';
import ProfilePictureUpload from '../components/profile-picture-upload/ProfilePictureUpload';
import axios from 'axios';

const UserProfile = () => {
  const userInfo = useContext(UserContext)
  const registrationDateRaw = new Date(userInfo.registration_date)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = registrationDateRaw.getDate();
  const monthName = czechMonthNames[registrationDateRaw.getMonth()];
  const year = registrationDateRaw.getFullYear();
  const registrationDate = `${dayOfMonth}. ${monthName} ${year}`;

  return (
    <div className="user-profile">
      <div className="user-info">
        <span>Jméno: {userInfo.first_name}</span>
        <span>Příjmení: {userInfo.last_name}</span>
      </div>
      <div className="profile-picture">
        {/* <img src="/uploads/chata-na-gruni.jpg" alt="" /> */}
        {/* <ProfilePictureUpload/> */}
      </div>
      <div className="user-info">
        <span>E-mail: {userInfo.email}</span>
        <span>Datum registrace: {registrationDate}</span>
      </div>
    </div>
  )
}
export default UserProfile;