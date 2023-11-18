import { useContext } from 'react';
import './ProfilePicture.scss'
import { UserContext } from '../../App';

const ProfilePicture = (props: any) => {
  const userInfo = useContext(UserContext)

  return (
    <img
      className={`profile-picture ${props.className}`}
      src={`http://127.0.0.1:5000/uploads/${userInfo.profile_picture}`}
      alt=""
    />
  )
}
export default ProfilePicture;