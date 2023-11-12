import './LoginPage.scss'
import { useEffect, useState } from 'react';
import axios from "axios";

const LoginPage = (props: any) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })
  const [responseMessage, setResponseMessage] = useState<string>('')

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
          password: response.data.password
        }
        props.setUser(loggedUser)
        localStorage.setItem('userData', JSON.stringify(loggedUser));
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          setResponseMessage(error.response.data.message)
        }
      })

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

  return (
    <div className="login-page">
      <div className="login-window">
        <h1>Přihlášení</h1>
        <form>
          <div className='login-input'>
            <label htmlFor="email-input">E-mail:</label>
            <input
              type="email"
              className='email-input'
              id='email-input'
              value={loginForm.email}
              name='email'
              onChange={handleChange}
            />
          </div>
          <div className='login-input'>
            <label htmlFor="password-input">Heslo:</label>
            <input
              type="password"
              className='password-input'
              id='password-input'
              value={loginForm.password}
              name='password'
              onChange={handleChange}
            />
          </div>
          <span className='text-danger'>{responseMessage}</span>
          <div className='login-other-options'>
            <a href='/registration'>registrovat se</a>
            <a href="/forgotten-password">zapomenuté heslo</a>
          </div>
          <div className='login-submit'>
            <button type='button' className='button btn-primary' onClick={submitLogin}>Přihlásit se</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default LoginPage;