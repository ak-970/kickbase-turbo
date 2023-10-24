import { useState, useEffect, /*useRef*/ } from 'react'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'

// data
import { clubs } from './data/clubs'

// components
import LoginForm from './components/LoginForm'
import Overview from './components/Overview'
import Squad from './components/Squad'
import Notification from './components/Notification'
// import Togglable from './components/Togglable'

// services
import loginService from './services/login'
import kickbaseService from './services/kickbase'
// import openligadbService from './services/openligadb'

const App = () => {

  // use states
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(null)
  const [tab, setTab] = useState('overview')
  const [notification, setNotification] = useState({ message : null, type : '' })


  // // use effects
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedKickbaseTurboUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      kickbaseService.setToken(user.token)
      // kickbaseService.setTokenExp(user.tokenExp)
      console.log('user', user)
    }
  }, [])

  useEffect(() => {
    user !== null && kickbaseService
      .getUsers()
      .then(u => {
        setUsers(u)
        console.log('users', u)
      })
  }, [user])



  // method functions
  const notify = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification({ ...notification, message : null })
    }, 5000)
  }

  const login = async (email, password) => {
    try {
      const user = await loginService.login({ email, password })
      window.localStorage.setItem(
        'loggedKickbaseTurboUser', JSON.stringify(user)
      )
      kickbaseService.setToken(user.token)
      setUser(user)
      console.log('user', user)

    } catch (exception) {
      notify('Wrong credentials', 'error')
    }
  }

  const logout = () => {
    window.localStorage.clear()
    setUser(null)
  }


  const content = () => {
    switch(tab) {
    case 'overview':
      return <Overview
        user={user}
        users={users}
        clubs={clubs}
      />
    case 'squad':
      return <Squad />
    case 'transfers':
      return <h2>Transfers...</h2>
    default:
      return
    }
  }

  return (
    <div>

      <h1>Kickbase Turbo</h1>

      <Notification message={notification.message} type={notification.type} />

      {user === null
        ? <LoginForm login={login} />
        : <>

          <section>
            <p>Logged in as {user.name} <button onClick={logout}>Logout</button></p>
          </section>

          <section>
            <nav>
              <button onClick={() => setTab('overview')}>Overview</button>&nbsp;
              <button onClick={() => setTab('squad')}>Kader</button>&nbsp;
              <button onClick={() => setTab('transfers')}>Transfers</button>
            </nav>
          </section>

          {content()}
        </>
      }

    </div>
  )
}

export default App