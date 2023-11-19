import { useEffect, useState } from 'react';
import './ProfilePicture.scss'
import axios from 'axios';

const ProfilePicture = (props: any) => {
  const [profilePictureName, setProfilePictureName] = useState<string>('profile-picture-default.png')

  useEffect(() => {
    axios({
      method: 'GET',
      url: `/user-profile-picture/${props.userId}`,
    })
    .then(res => {
      setProfilePictureName(res.data)
    })
    .catch(err => console.log(err))
  }, [props.userId])

  return (
    <img
      className={`profile-picture ${props.className}`}
      src={`http://127.0.0.1:5000/uploads/${profilePictureName}`}
      alt=""
    />
  )
}
export default ProfilePicture;