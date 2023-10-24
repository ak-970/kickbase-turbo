import { useState } from 'react'

const LoginForm = ({ login }) => {

  // use states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // event handlers
  const handleEmailChange = (event) => setEmail(event.target.value)
  const handlePasswordChange = (event) => setPassword(event.target.value)


  // method functions
  const handleLogin = async (event) => {
    event.preventDefault()
    login(email, password)
    setEmail('')
    setPassword('')
  }

  return (
    <section>
      <h2>Kickbase-Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor='email'>Kickbase-E-Mail: </label>
          <input id='email' type='email' value={email} onChange={handleEmailChange}/>
        </div>
        <div>
          <label htmlFor='password'>Kickbase-Password: </label>
          <input id='password' type='password' value={password} onChange={handlePasswordChange}/>
        </div>
        <input id='submitLogin' type='submit' value='Login'/>
      </form>
    </section>
  )
}

export default LoginForm