import './ForgottenPassword.scss'
import axios from "axios";
import { useEffect, useState } from 'react';
import Modal from '../../components/modal/Modal';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/error-message/ErrorMessage';

const ForgottenPassword = () => {
  const [forgottenPasswordEmail, setForgottenPasswordEmail] = useState<string>('')
  const [errorResponseMessage, setErrorResponseMessage] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [isForgottenPasswordModalOpen, setIsForgottenPasswordModalOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      e.key === 'Enter' && submitForgottenPassword(e)
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  })

  const submitForgottenPassword = (event: any) => {
    if (!forgottenPasswordEmail) {
      setErrorResponseMessage('Vyplňte pole e-mail!')
      return
    }
    axios({
      method: "POST",
      url: "/forgotten-password",
      data: {
        email: forgottenPasswordEmail
      }
    })
      .then((response: any) => {
        setNewPassword(response.data.new_password)
        setErrorResponseMessage('')
        response.data.result ? setIsForgottenPasswordModalOpen(true) : setErrorResponseMessage(response.data.response_message)
      }).catch((error: any) => {
        if (error.response) {
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })

    setForgottenPasswordEmail('')

    event.preventDefault()
  }

  const handleChange = (event: any) => {setForgottenPasswordEmail(event.target.value)}

  const closeForgottenPasswordModal = () => {setIsForgottenPasswordModalOpen(false)}

  const goToLogin = () => {navigate('/')}

  return (
    <div className="forgotten-password-page">
      <h1 className="h1 mathub-heading">MatHub</h1>
      <div className="forgotten-password-window">
        <h2 className='h2 form-heading'>Resetovat heslo</h2>
        <form>
          <div className='forgotten-password-input'>
            <label htmlFor="email-input">E-mail:</label>
            <input
              type="email"
              className='email-input'
              id='email-input'
              value={forgottenPasswordEmail}
              name='email'
              onChange={handleChange}
            />
          </div>
          <ErrorMessage content={errorResponseMessage} />
          <div className='forgotten-password-other-options'>
            <span onClick={() => navigate('/')}>zpět na přihlášení</span>
            <span onClick={() => navigate('/registration')}>registrovat se</span>
          </div>
          <div className='forgotten-password-submit'>
            <button type='button' className='get-new-password-button' onClick={submitForgottenPassword}>Získat nové heslo</button>
          </div>
        </form>
      </div>
      <Modal isOpen={isForgottenPasswordModalOpen} onClose={closeForgottenPasswordModal} onSubmit={goToLogin} submitContent='Přihlásit se' cancelContent='Zavřít'>
        {newPassword && (
          <div className='new-password-window'>
            <h2 className="new-password-heading">Heslo úspěšně resetováno!</h2>
            <span className='new-password-title'>Vaše nové heslo je:</span>
            <span className='new-password'>{newPassword}</span>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default ForgottenPassword;