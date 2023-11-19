import './UserProfile.scss'
import { ChangeEvent, FormEvent, useContext, useState } from 'react'
import { UserContext } from '../App';
import axios from 'axios';
import Modal from '../components/modal/Modal';
import ProfilePicture from '../components/profile-picture/ProfilePicture';

const UserProfile = (props: any) => {
  const userInfo = useContext(UserContext)
  const registrationDateRaw = new Date(userInfo.registration_date)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = registrationDateRaw.getDate();
  const monthName = czechMonthNames[registrationDateRaw.getMonth()];
  const year = registrationDateRaw.getFullYear();
  const registrationDate = `${dayOfMonth}. ${monthName} ${year}`;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false)
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState<boolean>(false)
  const [newPasswordForm, setNewPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [failureMessage, setFailureMessage] = useState<string>('')
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setNewProfilePicture(files[0]);
    }
  };

  const handleNewProfilePictureSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProfilePicture) {
      alert('Žádný zvolený obrázek!');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', newProfilePicture);

    try {
      await axios.post(`http://127.0.0.1:5000/upload-profile-picture/${userInfo.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      props.updateUser()
      closeProfilePictureModal()
      alert('Obrázek úspěšně nahrán!');
    } catch (error) {
      alert('Chyba při nahrávání obrázku :(');
    }
  };

  const changeProfilePicture = () => {
    setIsProfilePictureModalOpen(true)
  }

  const openChangePasswordModal = () => {
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setFailureMessage('')
  }

  const closeProfilePictureModal = () => {
    setIsProfilePictureModalOpen(false)
  }

  const changePassword = () => {
    setFailureMessage('')
    if (!newPasswordForm.newPassword || !newPasswordForm.newPasswordAgain || !newPasswordForm.oldPassword) return setFailureMessage('Vyplňte všechna pole!')
    if (newPasswordForm.newPassword !== newPasswordForm.newPasswordAgain) return setFailureMessage('Nová hesla se musí shodovat!')
    axios({
      method: 'POST',
      url: '/change-password',
      data: {
        user_id: userInfo.id,
        old_password: newPasswordForm.oldPassword,
        new_password: newPasswordForm.newPassword
      }
    })
      .then((res) => {
        if (res.data.success) {
          closePasswordModal()
          alert('Heslo úspěšně změněno!')
          setNewPasswordForm({
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: ''
          })
        } else {
          setFailureMessage('Chybně zadané staré heslo!')
        }
      })
      .catch(() => setFailureMessage('Někde se stala chyba :('))
  }

  const handleChange = (event: any) => {
    const { value, name } = event.target
    setNewPasswordForm((prevNote: any) => ({
      ...prevNote, [name]: value
    })
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      <div className="user-profile">
        <div className="user-wrapper">
          <div className="profile-picture-wrapper">
            <ProfilePicture className='large radius-100 border' userId={userInfo.id} />
          </div>
          <div className="user-info">
            <h1 className='h1'>{userInfo.first_name + ' ' + userInfo.last_name}</h1><hr />
            <div className="user-info-fields-wrapper">
              <div className="user-info-field">
                <h4 className='h4'>E-mail</h4><hr />
                <span>{userInfo.email}</span>
              </div>
              <div className="user-info-field">
                <h4 className='h4'>Datum registrace</h4><hr />
                <span>{registrationDate}</span>
              </div>
            </div>
          </div>
          <div className='account-operations'>
            <button className='button btn-primary' onClick={changeProfilePicture}>Změnit profilový obrázek</button>
            <button className='button btn-primary' onClick={openChangePasswordModal}>Změnit heslo</button>
          </div>
        </div>
      </div>
      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} onSubmit={changePassword} submitContent='Změnit heslo' cancelContent='Zrušit'>
        <h1>Změnit heslo</h1>
        <div className="new-password-form">
          <div className='password-input-wrapper'>
            <label htmlFor="old-password">Staré heslo:</label><br />
            <input type={showPassword ? 'text' : 'password'} id='old-password' name='oldPassword' value={newPasswordForm.oldPassword} onChange={handleChange} />
          </div>
          <div className='password-input-wrapper'>
            <label htmlFor="new-password">Nové heslo:</label><br />
            <input type={showPassword ? 'text' : 'password'} id='new-password' name='newPassword' value={newPasswordForm.newPassword} onChange={handleChange} />
          </div>
          <div className='password-input-wrapper'>
            <label htmlFor="new-password-again">Nové heslo znovu:</label><br />
            <input type={showPassword ? 'text' : 'password'} id='new-password-again' name='newPasswordAgain' value={newPasswordForm.newPasswordAgain} onChange={handleChange} />
          </div>
          <span className='text-danger'>{failureMessage}</span>
          <div className='password-visibility-wrapper'>
            <input type="checkbox" checked={showPassword} onChange={togglePasswordVisibility} id='password-visibility' />
            <label htmlFor="password-visibility">Zobrazit hesla</label>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isProfilePictureModalOpen} onClose={closeProfilePictureModal} onSubmit={handleNewProfilePictureSubmit} submitContent='Nahrát' cancelContent='Zrušit' >
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </Modal>
    </>
  )
}
export default UserProfile;