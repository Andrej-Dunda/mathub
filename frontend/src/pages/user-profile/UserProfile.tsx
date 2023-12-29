import './UserProfile.scss'
import { FormEvent, useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../App';
import axios from 'axios';
import Modal from '../../components/modal/Modal';
import ProfilePicture from '../../components/profile-picture/ProfilePicture';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import Snackbar from '../../components/snack-bar/SnackBar';
import FileUploader from '../../components/file-uploader/FileUploader';

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
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [newProfilePictureName, setNewProfilePictureName] = useState<string>('')
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const oldPasswordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    newProfilePicture && setErrorMessage('')
  }, [newProfilePicture])

  useEffect(() => {
    oldPasswordInputRef.current?.focus()
  }, [isPasswordModalOpen])

  const handleNewProfilePictureSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProfilePicture) {
      setErrorMessage('Žádný zvolený obrázek!');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', newProfilePicture);

    try {
      await axios.post(`/upload-profile-picture/${userInfo.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      props.updateUser()
      closeProfilePictureModal()
      showSnackbarMessage('Obrázek úspěšně nahrán!');
      setErrorMessage('')
    } catch (error) {
      setErrorMessage('Chyba při nahrávání obrázku :(');
    }
  };

  const changeProfilePicture = () => {
    setIsProfilePictureModalOpen(true)
    setErrorMessage('')
    setNewProfilePictureName('')
  }

  const openChangePasswordModal = () => {
    setShowPassword(false)
    setIsPasswordModalOpen(true)
    setErrorMessage('')
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setErrorMessage('')
  }

  const closeProfilePictureModal = () => {
    setIsProfilePictureModalOpen(false)
  }

  const changePassword = () => {
    setErrorMessage('')
    if (!newPasswordForm.newPassword || !newPasswordForm.newPasswordAgain || !newPasswordForm.oldPassword) return setErrorMessage('Vyplňte všechna pole!')
    if (newPasswordForm.newPassword !== newPasswordForm.newPasswordAgain) return setErrorMessage('Nová hesla se musí shodovat!')
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
          showSnackbarMessage('Heslo úspěšně změněno!')
          setNewPasswordForm({
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: ''
          })
        } else {
          setErrorMessage('Chybně zadané staré heslo!')
        }
      })
      .catch(() => setErrorMessage('Někde se stala chyba :('))
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

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true)
    setSnackbarMessage(message)
  }

  return (
    <>
      <div className="user-profile">
        <div className="user-wrapper">
          <div className="profile-picture-wrapper">
            <ProfilePicture className='large radius-100 border-black' userId={userInfo.id} />
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
            <button onClick={changeProfilePicture}>Změnit profilový obrázek</button>
            <button onClick={openChangePasswordModal}>Změnit heslo</button>
          </div>
        </div>
      </div>
      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} onSubmit={changePassword} submitContent='Změnit heslo' cancelContent='Zrušit'>
        <h1 className='h1'>Změnit heslo</h1>
        <div className="new-password-form">
          <div className='password-input-wrapper'>
            <label htmlFor="old-password">Staré heslo:</label>
            <input type={showPassword ? 'text' : 'password'} id='old-password' name='oldPassword' value={newPasswordForm.oldPassword} onChange={handleChange} ref={oldPasswordInputRef} />
          </div>
          <div className='password-input-wrapper'>
            <label htmlFor="new-password">Nové heslo:</label>
            <input type={showPassword ? 'text' : 'password'} id='new-password' name='newPassword' value={newPasswordForm.newPassword} onChange={handleChange} />
          </div>
          <div className='password-input-wrapper'>
            <label htmlFor="new-password-again">Nové heslo znovu:</label>
            <input type={showPassword ? 'text' : 'password'} id='new-password-again' name='newPasswordAgain' value={newPasswordForm.newPasswordAgain} onChange={handleChange} />
          </div>
          <ErrorMessage content={errorMessage}/>
          <div className='password-visibility-wrapper'>
            <input type="checkbox" checked={showPassword} onChange={togglePasswordVisibility} id='password-visibility' />
            <label htmlFor="password-visibility">Zobrazit hesla</label>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isProfilePictureModalOpen} onClose={closeProfilePictureModal} onSubmit={handleNewProfilePictureSubmit} submitContent='Nahrát' cancelContent='Zrušit' >
        <div className="new-profile-picture">
          <FileUploader
            label='Nahrát nový obrázek'
            labelClassName='profile-picture-upload-label'
            acceptAttributeValue='image/*'
            setFile={setNewProfilePicture}
            setFileName={setNewProfilePictureName}
          />
          {newProfilePictureName && <span className='uploaded-image-name'>
            {`Nahraný obrázek: ${newProfilePictureName}`}
          </span>}
          <ErrorMessage content={errorMessage} />
        </div>
      </Modal>
      <Snackbar
        message={snackbarMessage}
        onClose={handleCloseSnackbar}
        showSnackbar={showSnackbar}
        setShowSnackbar={setShowSnackbar}
      />
    </>
  )
}
export default UserProfile;