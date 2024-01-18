import './Registration.scss'
import { useEffect, useState, useRef } from 'react';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as MatHubLogo } from '../../images/mathub-logo.svg';
import { useNav } from '../../contexts/NavigationProvider';
import { useSnackbar } from '../../contexts/SnackbarProvider';
import httpClient from '../../utils/httpClient';

const Registration = () => {
  const [registrationForm, setRegistrationForm] = useState({
    email: "",
    password: "",
    password_again: "",
    first_name: "",
    last_name: "",
  })
  const [responseMessage, setResponseMessage] = useState<string>('')
  const emailInputRef = useRef<HTMLInputElement>(null)
  const firstNameInputRef = useRef<HTMLInputElement>(null)
  const lastNameInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const passwordAgainInputRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toLogin, toForgottenPassword } = useNav();
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      e.key === 'Enter' && submitRegistration(e)
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  })

  const validateEmail = (email: string) => {
    // Regular expression for email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailRegex.test(email);
  };

  const errorResponse = (message: string, inputRef: React.RefObject<HTMLInputElement>) => {
    setResponseMessage(message)
    inputRef.current?.focus()
  }

  const submitRegistration = (event: any) => {
    setResponseMessage('')

    if (!registrationForm.first_name) return errorResponse('Vyplňte pole Jméno!', firstNameInputRef)
    if (!registrationForm.last_name) return errorResponse('Vyplňte pole Příjmení!', lastNameInputRef)
    if (!registrationForm.email) return errorResponse('Vyplňte pole E-mail!', emailInputRef)
    if (!validateEmail(registrationForm.email)) return errorResponse('Neplatný formát emailu!', emailInputRef)
    if (!registrationForm.password) return errorResponse('Vyplňte pole Heslo!', passwordInputRef)
    if (!registrationForm.password_again) return errorResponse('Vyplňte pole Heslo znovu!', passwordAgainInputRef)
    if (registrationForm.password !== registrationForm.password_again) return errorResponse('Hesla se neshodují!', passwordInputRef)
    if (registrationForm.password.length < 8) return errorResponse('Heslo musí být alespoň 8 znaků dlouhé!', passwordInputRef)
    if (!/[A-Z]/.test(registrationForm.password)) return errorResponse('Heslo musí alespoň 1 velké písmeno!', passwordInputRef)
    if (!/[a-z]/.test(registrationForm.password)) return errorResponse('Heslo musí alespoň 1 malé písmeno!', passwordInputRef)
    if (!/[0-9]/.test(registrationForm.password)) return errorResponse('Heslo musí alespoň 1 číslo!', passwordInputRef)

    httpClient.post("/api/registration", {
        email: registrationForm.email,
        password: registrationForm.password,
        first_name: registrationForm.first_name,
        last_name: registrationForm.last_name
      })
      .then((response: any) => {
        setResponseMessage(response.data.message)
        if (response.status === 200) {
          setRegistrationForm({
            email: "",
            password: "",
            password_again: "",
            first_name: "",
            last_name: ""
          })
          toLogin()
          openSnackbar('Registrace proběhla úspěšně!')
        } else {
          response.data.email_already_registered ? emailInputRef.current?.focus() : setRegistrationForm({
            email: "",
            password: "",
            password_again: "",
            first_name: "",
            last_name: ""
          })
        }
      }).catch((error: any) => {
        if (error.response) {
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })

    event.preventDefault()
  }

  const handleChange = (event: any) => {
    const { value, name } = event.target
    setRegistrationForm((prevNote: any) => ({
      ...prevNote, [name]: value
    })
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="registration-page">
      <div className="logo-and-title">
        <MatHubLogo color={grayscale900} className='mathub-logo' />
        <h1 className="mathub-title">MatHub</h1>
      </div>
      <div className="registration-window">
        <h2 className='h2 form-heading'>Registrace</h2>
        <form>
          <div className="form-body">
            <div className='registration-input first-last-name-inputs'>
              <div className='name-input'>
                <label htmlFor="first-name-input">Jméno:</label>
                <input
                  type="text"
                  className='first-name-input'
                  id='first-name-input'
                  value={registrationForm.first_name}
                  name='first_name'
                  onChange={handleChange}
                  ref={firstNameInputRef}
                />
              </div>
              <div className='name-input'>
                <label htmlFor="last-name-input">Příjmení:</label>
                <input
                  type="text"
                  className='last-name-input'
                  id='last-name-input'
                  value={registrationForm.last_name}
                  name='last_name'
                  onChange={handleChange}
                  ref={lastNameInputRef}
                />
              </div>
            </div>
            <div className='registration-input'>
              <label htmlFor="email-input">E-mail:</label>
              <input
                type="email"
                className='email-input'
                id='email-input'
                value={registrationForm.email}
                name='email'
                onChange={handleChange}
                ref={emailInputRef}
              />
            </div>
            <div className='registration-input visibility-toggle'>
              <label htmlFor="password-input">Heslo:</label>
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='password-input'
                  id='password-input'
                  value={registrationForm.password}
                  name='password'
                  onChange={handleChange}
                  ref={passwordInputRef}
                  title='Alespoň 8 znaků, 1 velké a malé písmeno, 1 číslo'
                />
                <FontAwesomeIcon onClick={togglePasswordVisibility} className={`eye-icon ${!showPassword && 'password-hidden'}`} icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>
            <div className='registration-input'>
              <label htmlFor="password-again-input">Heslo znovu:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className='password-again-input'
                id='password-again-input'
                value={registrationForm.password_again}
                name='password_again'
                onChange={handleChange}
                ref={passwordAgainInputRef}
                title='Alespoň 8 znaků, 1 velké a malé písmeno, 1 číslo'
              />
            </div>
          </div>
          <div className="form-footer">
            <div className='registration-other-options'>
              <span onClick={toLogin}>zpět na přihlášení</span>
              <span onClick={toForgottenPassword}>zapomenuté heslo</span>
            </div>
            <ErrorMessage content={responseMessage} />
            <div className='registration-submit'>
              <button type='button' className='registration-submit-button' onClick={submitRegistration}>Registrovat se</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Registration;