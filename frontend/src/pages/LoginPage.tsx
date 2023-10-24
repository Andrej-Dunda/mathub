import './LoginPage.scss'
const LoginPage = (props: any) => {
  return (
    <div className="login-page">
      <div className="login-window">
        <form>
          <div className='login-input'>
            <label htmlFor="username-input">Uživatelské jméno:</label>
            <input type="text" className='username-input' id='username-input'/>
          </div>
          <div className='login-input'>
            <label htmlFor="password-input">Heslo:</label>
            <input type="password" className='password-input' id='password-input' />
          </div>
          <div className='login-other-options'>
            <a href='/registration'>registrovat se</a>
            <a href="/forgotten-password">zapomenuté heslo</a>
          </div>
          <div className='login-submit'>
            <button type='submit'>Přihlásit se</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default LoginPage;