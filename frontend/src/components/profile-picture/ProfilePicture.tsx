import { useUserData } from '../../contexts/UserDataProvider';
import './ProfilePicture.scss'
import { useEffect, useState } from 'react';
import { ReactComponent as DefaultProfilePicture} from '../../images/default-profile-picture.svg'

interface iProfilePicture {
  className?: string;
  userId: string;
  onClick?: () => void;
}

const ProfilePicture: React.FC<iProfilePicture> = ({ className, userId, onClick }) => {

  // State to manage image source URL
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const { user } = useUserData();

  useEffect(() => {
    setProfilePictureUrl(userId ? `/api/profile-picture/${userId}?${Math.random()}` : '')
  }, [userId, user.profile_picture])

  return (
    <>
    {
      profilePictureUrl ? (
        <img
          className={`profile-picture ${className}`}
          src={profilePictureUrl}
          alt=""
          onClick={() => onClick && onClick()}
        />
  ) : <DefaultProfilePicture className={`profile-picture ${className}`} />
    }
    </>
  );
};
export default ProfilePicture;