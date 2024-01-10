import { useUserData } from '../../contexts/UserDataProvider';
import './ProfilePicture.scss'
import { useEffect, useState } from 'react';

interface iProfilePicture {
  className?: string;
  userId: number;
  onClick?: () => void;
}

const ProfilePicture: React.FC<iProfilePicture> = ({ className, userId, onClick }) => {

  // State to manage image source URL
  const [imgSrc, setImgSrc] = useState<string>(`http://127.0.0.1:5000/profile-picture/${userId}`);
  const { user } = useUserData();

  useEffect(() => {
    // Append a timestamp or a random query parameter to force reload the image from the server
    setImgSrc(`http://127.0.0.1:5000/profile-picture/${userId}?${new Date().getTime()}`);
  }, [userId, user.profile_picture])

  return (
    <img
      className={`profile-picture ${className}`}
      src={imgSrc}
      alt=""
      onClick={() => onClick && onClick()}
    />
  );
};
export default ProfilePicture;