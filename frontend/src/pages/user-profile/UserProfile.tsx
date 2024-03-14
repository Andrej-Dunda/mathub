import './UserProfile.scss'
import ProfilePicture from '../../components/profile-picture/ProfilePicture';
import { useUserData } from '../../contexts/UserDataProvider';
import { useModal } from '../../contexts/ModalProvider';
import ChangePasswordModalContent from '../../components/modal/modal-contents/ChangePasswordModalContent';
import ChangeProfilePictureModalContent from '../../components/modal/modal-contents/ChangeProfilePictureModalContent';

const UserProfile = () => {
  const { user } = useUserData();
  const { showModal } = useModal();
  const registrationDateRaw = new Date(user.registration_date)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = registrationDateRaw.getDate();
  const monthName = czechMonthNames[registrationDateRaw.getMonth()];
  const year = registrationDateRaw.getFullYear();
  const registrationDate = `${dayOfMonth}. ${monthName} ${year}`;

  const openChangePasswordModal = () => {
    showModal(<ChangePasswordModalContent />)
  }

  const changeProfilePicture = () => {
    showModal(<ChangeProfilePictureModalContent />)
  }

  return (
    <div className="user-profile">
      <div className="user-wrapper">
        <ProfilePicture className='large radius-100 box-shadow-dark' userId={user._id} />
        <div className="user-info">
          <h1 className='h1'>{user.first_name + ' ' + user.last_name}</h1><hr/>
          <div className="user-info-fields-wrapper">
            <div className="user-info-field">
              <span className='email-label label'>E-mail</span>
              <span className='email info'>{user.email}</span>
            </div>
            <div className="user-info-field">
              <span className='registration-date-label label'>Datum registrace</span>
              <span className='registration-date info'>{registrationDate}</span>
            </div>
          </div><hr/>
        </div>
        <div className='account-operations'>
          <button onClick={changeProfilePicture}>Změnit profilový obrázek</button>
          <button onClick={openChangePasswordModal}>Změnit heslo</button>
        </div>
      </div>
    </div>
  )
}
export default UserProfile;