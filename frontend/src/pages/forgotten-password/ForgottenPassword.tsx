import './ForgottenPassword.scss'
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import CopyToClipboard from '../../components/buttons/copy-to-clipboard/CopyToClipboard';
import { useNav } from '../../contexts/NavigationProvider';
import { useModal } from '../../contexts/ModalProvider';
import ModalFooter from '../../components/modal/modal-footer/ModalFooter';
import httpClient from '../../utils/httpClient';

interface iForgottenPasswordModalContent {
  newPassword: string;
  modalSubmit: () => void;
}

const ForgottenPasswordModalContent: React.FC<iForgottenPasswordModalContent> = ({ newPassword, modalSubmit }) => {
  return (
    <div className='forgotten-password-modal-content'>
      <h2 className="new-password-heading">Heslo úspěšně resetováno!</h2>
      <div className="new-password-wrapper">
        <span className='new-password-title'>Vaše nové heslo je:</span>
        <CopyToClipboard textToCopy={newPassword} label={newPassword} labelClassName='new-password' />
      </div>
      <ModalFooter onSubmit={modalSubmit} submitButtonLabel='Přihlásit se' cancelButtonLabel='Zavřít' />
    </div>
  )
}

const ForgottenPassword = () => {
  const [forgottenPasswordEmail, setForgottenPasswordEmail] = useState<string>('')
  const [errorResponseMessage, setErrorResponseMessage] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toLogin, toRegistration } = useNav();
  const { showModal, closeModal } = useModal();

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      e.key === 'Enter' && submitForgottenPassword(e)
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  })

  useEffect(() => {
    newPassword && openForgottenPasswordModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPassword])

  const submitForgottenPassword = (event: any) => {
    if (!forgottenPasswordEmail) return setErrorResponseMessage('Vyplňte pole e-mail!')
    httpClient.get(`/api/users/${forgottenPasswordEmail}/forgotten-password`)
      .then((response: any) => {
        setNewPassword(response.data.new_password)
        setErrorResponseMessage('')
        if (response.data.result) setErrorResponseMessage(response.data.response_message)
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

  const handleChange = (event: any) => { setForgottenPasswordEmail(event.target.value) }

  const modalSubmit = () => {
    closeModal();
    toLogin();
  }

  const openForgottenPasswordModal = () => {
    showModal(<ForgottenPasswordModalContent newPassword={newPassword} modalSubmit={modalSubmit} />)
  }

  return (
    <div className="forgotten-password-page">
      <div className="logo-and-title">
        <MatHubLogo color={grayscale900} className='mathub-logo' />
        <h1 className="mathub-title unselectable">MatHub</h1>
      </div>
      <div className="forgotten-password-window">
        <h2 className='h2 form-heading unselectable'>Resetovat heslo</h2>
        <form id='forgotten-password-form'>
          <div className='forgotten-password-input'>
            <label htmlFor="email-input" className='unselectable'>E-mail:</label>
            <input
              type="email"
              className='email-input'
              id='email-input'
              value={forgottenPasswordEmail}
              name='email'
              onChange={handleChange}
              autoComplete='email'
              maxLength={256}
            />
          </div>
          <div className='forgotten-password-other-options'>
            <span onClick={toLogin} className='unselectable'>zpět na přihlášení</span>
            <span onClick={toRegistration} className='unselectable'>registrovat se</span>
          </div>
          <ErrorMessage content={errorResponseMessage} />
          <div className='forgotten-password-submit'>
            <button type='button' className='get-new-password-button' onClick={submitForgottenPassword}>Získat nové heslo</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default ForgottenPassword;