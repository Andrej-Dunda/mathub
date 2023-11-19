import './ForgottenPassword.scss'
import axios from "axios";
import { useEffect, useState } from 'react';

const ForgottenPassword = () => {
  const [forgottenPasswordEmail, setForgottenPasswordEmail] = useState<string>('')
  const [responseMessage, setResponseMessage] = useState<string>('')
  const [resetResult, setResetResult] = useState<boolean>()
  const [newPassword, setNewPassword] = useState<string>('')

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
    axios({
      method: "POST",
      url: "/forgotten-password",
      data: {
        email: forgottenPasswordEmail
      }
    })
      .then((response: any) => {
        console.error(response.data.console_message)
        setNewPassword(response.data.new_password)
        setResponseMessage(response.data.response_message)
        setResetResult(response.data.result)
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

  const handleChange = (event: any) => {
    setForgottenPasswordEmail(event.target.value)
  }

  const handleEmptyEmailInput = () => {
    setResponseMessage('Vyplňte pole e-mail!')
    setResetResult(false)
  }

  return (
    <div className="forgotten-password-page">
      <div className="forgotten-password-window">
        <h1>Resetovat heslo</h1>
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
          <span  className={resetResult ? 'text-success' : 'text-danger'}>{responseMessage}</span>
          <div className='forgotten-password-other-options'>
            <a href='/'>zpět na přihlášení</a>
            <a href="/registration">registrovat se</a>
          </div>
          <div className='forgotten-password-submit'>
            <button type='button' className='button btn-primary' onClick={!forgottenPasswordEmail ? handleEmptyEmailInput : submitForgottenPassword}>Získat nové heslo</button>
          </div>
        </form>
        {newPassword && <span>Vaše nové heslo je: <b>{newPassword}</b></span>}
      </div>
    </div>
  )
}
export default ForgottenPassword;