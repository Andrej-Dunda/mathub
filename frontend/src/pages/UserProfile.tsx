import axios from 'axios'
import './UserProfile.scss'
import { useEffect, useState } from 'react'

interface iUser {
  profile_name: string;
  about_me: string;
}

const UserProfile = (props: any) => {
  const [profileData, setProfileData] = useState<iUser | null>(null)

  useEffect(() => {
    console.log(props.token)
    getData();
  }, [])

  const getData = () => {
    axios({
      method: "GET",
      url:"/profile",
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then((response) => {
      const res = response.data
      res.access_token && props.setToken(res.access_token)
      setProfileData(({
        profile_name: res.name,
        about_me: res.about}))
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.message)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}

  return (
    <div className="user-profile">
      <h1>
        Profil uživatele
      </h1>
      <div>Uživatelské jméno: {profileData ? profileData.profile_name : 'NaN'}</div>
      <div>O uživateli: {profileData ? profileData.about_me : 'NaN'}</div>
    </div>
  )
}
export default UserProfile;