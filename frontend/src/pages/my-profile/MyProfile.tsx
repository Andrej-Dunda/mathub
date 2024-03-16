import './MyProfile.scss'
import ProfilePicture from '../../components/profile-picture/ProfilePicture';
import { useUserData } from '../../contexts/UserDataProvider';
import { useModal } from '../../contexts/ModalProvider';
import ChangePasswordModalContent from '../../components/modal/modal-contents/ChangePasswordModalContent';
import ChangeProfilePictureModalContent from '../../components/modal/modal-contents/ChangeProfilePictureModalContent';
import { normalizeDate } from '../../utils/normalizeDate';

const MyProfile = () => {
  const { user } = useUserData();
  const { showModal } = useModal();

  const openChangePasswordModal = () => {
    showModal(<ChangePasswordModalContent />)
  }

  const changeProfilePicture = () => {
    showModal(<ChangeProfilePictureModalContent />)
  }

  return (
        <div className="my-profile">
          <div className="user-wrapper">
            <ProfilePicture className='large radius-100 box-shadow-dark' userId={user._id} redirect={false} />
            <div className="user-info">
              <h1 className='h1'>{user.first_name + ' ' + user.last_name}</h1><hr />
              <div className="user-info-fields-wrapper">
                <div className="user-info-field">
                  <span className='email-label label'>E-mail</span>
                  <span className='email info'>{user.user_email}</span>
                </div>
                <div className="user-info-field">
                  <span className='registration-date-label label'>Datum registrace</span>
                  <span className='registration-date info'>{normalizeDate(user.registration_date)}</span>
                </div>
              </div><hr />
            </div>
            <div className='account-operations'>
              <button onClick={changeProfilePicture}>Změnit profilový obrázek</button>
              <button onClick={openChangePasswordModal}>Změnit heslo</button>
            </div>
          </div>
        </div>
  )
}
export default MyProfile;