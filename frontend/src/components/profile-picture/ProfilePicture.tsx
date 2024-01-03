import { useUserData } from '../../contexts/UserDataProvider';
import './ProfilePicture.scss'
import { useEffect, useState } from 'react';

const ProfilePicture = (props: any) => {

  // State to manage image source URL
  const [imgSrc, setImgSrc] = useState<string>(`http://127.0.0.1:5000/profile-picture/${props.userId}`);
  const { user } = useUserData();

  useEffect(() => {
    // Append a timestamp or a random query parameter to force reload the image from the server
    setImgSrc(`http://127.0.0.1:5000/profile-picture/${props.userId}?${new Date().getTime()}`);
  }, [props.userId, user.profile_picture])

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