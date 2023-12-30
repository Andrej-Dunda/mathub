import './ProfilePicture.scss'
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';

const ProfilePicture = (props: any) => {

  // State to manage image source URL
  const [imgSrc, setImgSrc] = useState<string>(`http://127.0.0.1:5000/profile-picture/${props.userId}`);
  const userInfo = useContext(UserContext)

  useEffect(() => {
    // Append a timestamp or a random query parameter to force reload the image from the server
    setImgSrc(`http://127.0.0.1:5000/profile-picture/${props.userId}?${new Date().getTime()}`);
  }, [props.userId, userInfo.profile_picture])

  return (
    <img
      className={`profile-picture ${props.className}`}
      src={imgSrc}
      alt=""
      onClick={() => props.onClick()}
    />
  );
};
export default ProfilePicture;