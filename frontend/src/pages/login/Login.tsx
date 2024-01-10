import './Login.scss'
import { useEffect, useRef, useState } from 'react';
import axios from "axios";
import ErrorMessage from '../../components/error-message/ErrorMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useUserData } from '../../contexts/UserDataProvider';
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import { useNav } from '../../contexts/NavigationProvider';

const LoginPage = (props: any) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })
  const [responseMessage, setResponseMessage] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const { setUser } = useUserData();
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toRegistration, toForgottenPassword } = useNav();

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      e.key === 'Enter' && submitLogin(e)
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  })

  const submitLogin = (event: any) => {
    if (!loginForm.email || !loginForm.password) return setResponseMessage('Vyplňte všechna pole!')
    axios({
      method: "POST",
      url: "/login",
      data: {
        email: loginForm.email,
        password: loginForm.password
      }
    })
      .then((response: any) => {
        props.setToken(response.data.access_token)
        setResponseMessage(response.data.message)
        const loggedUser = {
          id: response.data.user_id,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          profile_picture: response.data.profile_picture,
          registration_date: response.data.registration_date
        }
        setUser(loggedUser)
        localStorage.setItem('userData', JSON.stringify(loggedUser));
      }).catch((error: any) => error.response && setResponseMessage(error.response.data.message))

    setLoginForm(({
      email: "",
      password: ""
    }))

    event.preventDefault()
  }

  const handleChange = (event: any) => {
    const { value, name } = event.target
    setLoginForm((prevNote: any) => ({
      ...prevNote, [name]: value
    })
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-page">
      <div className="logo-and-title">
        <MatHubLogo color={grayscale900} className='mathub-logo' />
        <h1 className="mathub-title">MatHub</h1>
      </div>
      <div className="login-window">
        <h2 className='h2 form-heading'>Přihlášení</h2>
        <form>
          <div className="form-body">
            <div className='login-input'>
              <label htmlFor="email-input">E-mail:</label>
              <input
                type="email"
                className='email-input'
                id='email-input'
                value={loginForm.email}
                name='email'
                onChange={handleChange}
                ref={emailInputRef}
              />
            </div>
            <div className='login-input visibility-toggle'>
              <label htmlFor="password-input">Heslo:</label>
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='password-input'
                  id='password-input'
                  value={loginForm.password}
                  name='password'
                  onChange={handleChange}
                  ref={passwordInputRef}
                />
                <FontAwesomeIcon onClick={togglePasswordVisibility} className={`eye-icon ${!showPassword && 'password-hidden'}`} icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
          </div>
          <div className="form-footer">
            <div className='login-other-options'>
              <span onClick={toRegistration}>registrovat se</span>
              <span onClick={toForgottenPassword}>zapomenuté heslo</span>
            </div>
            <ErrorMessage content={responseMessage} />
            <div className='login-submit'>
              <button type='button' className='login-button' onClick={submitLogin}>Přihlásit se</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
export default LoginPage;