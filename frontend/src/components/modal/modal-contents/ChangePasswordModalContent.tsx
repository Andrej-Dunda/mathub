import './ChangePasswordModalContent.scss'
import { useEffect, useRef, useState } from 'react'
import ErrorMessage from '../../../components/error-message/ErrorMessage';
import Checkbox from '../../../components/buttons/checkbox/Checkbox';
import { useUserData } from '../../../contexts/UserDataProvider';
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useModal } from '../../../contexts/ModalProvider';
import ModalFooter from '../../../components/modal/modal-footer/ModalFooter';
import { useAuth } from '../../../contexts/AuthProvider';

const ChangePasswordModalContent: React.FC = () => {
  const { closeModal, modalOpen } = useModal();
  const { openSnackbar } = useSnackbar();
  const { protectedHttpClientInit } = useAuth();
  const { user } = useUserData();
  const oldPasswordInputRef = useRef<HTMLInputElement>(null)
  const [newPasswordForm, setNewPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    setShowPassword(false)
    setErrorMessage('')
  }, [])

  useEffect(() => {
    oldPasswordInputRef.current?.focus()
  }, [modalOpen])

  const changePassword = async () => {
    setErrorMessage('')
    if (!newPasswordForm.newPassword || !newPasswordForm.newPasswordAgain || !newPasswordForm.oldPassword) return setErrorMessage('Vyplňte všechna pole!')
    if (newPasswordForm.newPassword !== newPasswordForm.newPasswordAgain) return setErrorMessage('Hesla se neshodují!')
    if (newPasswordForm.newPassword.length < 8) return setErrorMessage('Heslo musí být alespoň 8 znaků dlouhé!')
    if (!/[A-Z]/.test(newPasswordForm.newPassword)) return setErrorMessage('Heslo musí alespoň 1 velké písmeno!')
    if (!/[a-z]/.test(newPasswordForm.newPassword)) return setErrorMessage('Heslo musí alespoň 1 malé písmeno!')
    if (!/[0-9]/.test(newPasswordForm.newPassword)) return setErrorMessage('Heslo musí alespoň 1 číslo!')
    if (newPasswordForm.newPassword.length > 50) return setErrorMessage('Heslo může mít maximálně 50 znaků!')
    
    const protectedHttpClient = await protectedHttpClientInit();
    if (protectedHttpClient) protectedHttpClient.post('/api/change-password', {
        user_id: user._id,
        old_password: newPasswordForm.oldPassword,
        new_password: newPasswordForm.newPassword
      })
      .then((res) => {
        if (res.data.success) {
          closeModal()
          openSnackbar('Heslo úspěšně změněno!')
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
    else closeModal()
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
    <div className="new-password-form">
      <h1>Změnit heslo</h1>
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
      <ErrorMessage content={errorMessage} />
      <div className='password-visibility-wrapper'>
        <Checkbox checked={showPassword} onToggle={togglePasswordVisibility} label='Zobrazit hesla' />
      </div>
      <ModalFooter onSubmit={changePassword} submitButtonLabel='Změnit heslo' cancelButtonLabel='Zrušit'/>
    </div>
  )
}
export default ChangePasswordModalContent;