import { useUserData } from '../../contexts/UserDataProvider';
import './ProfilePicture.scss'
import { useEffect, useState } from 'react';
import { ReactComponent as DefaultProfilePicture} from '../../images/default-profile-picture.svg'
import { useNav } from '../../contexts/NavigationProvider';

interface iProfilePicture {
  className?: string;
  userId: string;
  onClick?: () => void;
  redirect?: boolean;
}

const ProfilePicture: React.FC<iProfilePicture> = ({ className, userId, onClick, redirect = true }) => {
  const { toUserProfile } = useNav();

  // State to manage image source URL
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const { user } = useUserData();

  useEffect(() => {
    setProfilePictureUrl(userId ? `/api/users/${userId}/profile-picture?${Math.random()}` : '')
  }, [userId, user.profile_picture])

  return (
    <>
    {
      profilePictureUrl ? (
        <img
          className={`profile-picture ${className} ${redirect ? '' : 'not-clickable'}`}
          src={profilePictureUrl}
          alt=""
          draggable="false"
          onClick={() => {
            onClick && onClick()
            redirect && userId && toUserProfile(userId)
          }}
        />
  ) : <DefaultProfilePicture className={`profile-picture ${className}`} />
    }
    </>
  );
};
export default ProfilePicture;