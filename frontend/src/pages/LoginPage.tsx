import './LoginPage.scss'
import { useState } from 'react';
import axios from "axios";

const LoginPage = (props: any) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })

  const submitLogin = (event: any) => {
    axios({
      method: "POST",
      url:"/login",
      data:{
        email: loginForm.email,
        password: loginForm.password
       }
    })
    .then((response: any) => {
      props.setToken(response.data.access_token)
      console.log(response.data.access_token)
    }).catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })

    setLoginForm(({
      email: "",
      password: ""}))

    event.preventDefault()
  }

  const handleChange = (event: any) => { 
    const {value, name} = event.target
    setLoginForm((prevNote: any) => ({
        ...prevNote, [name]: value})
    )
  }

  return (
    <div className="login-page">
      <div className="login-window">
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
        <div className='login-other-options'>
          <a href='/registration'>registrovat se</a>
          <a href="/forgotten-password">zapomenuté heslo</a>
        </div>
        <div className='login-submit'>
          <button onClick={submitLogin}>Přihlásit se</button>
        </div>
      </form>
    </div>
      
      {/* {
        activeForm === 'forgotten-password'
          ? <ForgottenPassword setActiveForm={setActiveForm} />
          : activeForm === 'registration'
            ? <Registration setActiveForm={setActiveForm} />
            : <Login setActiveForm={setActiveForm} />
      } */}
    </div>
  )
}
export default LoginPage;