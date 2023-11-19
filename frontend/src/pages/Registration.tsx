import './Registration.scss'
import axios from "axios";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"

const Registration = (props: any) => {
  const [registrationForm, setRegistrationForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: ""
  })
  const [responseMessage, setResponseMessage] = useState<string>('')
  const navigate = useNavigate()

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

  const submitRegistration = (event: any) => {
    if (!registrationForm.email || !registrationForm.password || !registrationForm.first_name || !registrationForm.last_name) return setResponseMessage('Vyplňte všechna pole!')
    if (!validateEmail(registrationForm.email)) return setResponseMessage('Neplatný formát emailu!')
    axios({
      method: "POST",
      url: "/registration",
      data: {
        email: registrationForm.email,
        password: registrationForm.password,
        first_name: registrationForm.first_name,
        last_name: registrationForm.last_name
      }
    })
      .then((response: any) => {
        setResponseMessage(response.data.message)
        navigate('/')
      }).catch((error: any) => {
        if (error.response) {
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })

    setRegistrationForm(({
      email: "",
      password: "",
      first_name: "",
      last_name: ""
    }))

    event.preventDefault()
  }

  const handleChange = (event: any) => {
    const { value, name } = event.target
    setRegistrationForm((prevNote: any) => ({
      ...prevNote, [name]: value
    })
    )
  }

  return (
    <div className="registration-page">
      <div className="registration-window">
        <h1>Registrace</h1>
        <form>
          <div className='registration-input'>
            <label htmlFor="first-name-input">Jméno:</label>
            <input
              type="text"
              className='first-name-input'
              id='first-name-input'
              value={registrationForm.first_name}
              name='first_name'
              onChange={handleChange}
            />
          </div>
          <div className='registration-input'>
            <label htmlFor="last-name-input">Příjmení:</label>
            <input
              type="text"
              className='last-name-input'
              id='last-name-input'
              value={registrationForm.last_name}
              name='last_name'
              onChange={handleChange}
            />
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
            />
          </div>
          <div className='registration-input'>
            <label htmlFor="password-input">Heslo:</label>
            <input
              type="password"
              className='password-input'
              id='password-input'
              value={registrationForm.password}
              name='password'
              onChange={handleChange}
            />
          </div>
          <span className='text-danger'>{responseMessage}</span>
          <div className='registration-other-options'>
            <a href='/'>zpět na přihlášení</a>
            <a href="/forgotten-password">zapomenuté heslo</a>
          </div>
          <div className='registration-submit'>
            <button type='button' className='button btn-primary' onClick={submitRegistration}>Registrovat se</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Registration;