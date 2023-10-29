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
  const [league, setLeague] = useState(0)
  const [users, setUsers] = useState(null)
  // const [tab, setTab] = useState('overview')
  const [tab, setTab] = useState('squad')
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

      setLeague(user.leagues[0].id)
    }
  }, [])

  useEffect(() => {
    user !== null && kickbaseService
      .getUsers(league)
      .then(u => {
        setUsers(u)
        console.log('users', u)
      })
  }, [user, league])


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

      setLeague(user.leagues[0].id)

    } catch (exception) {
      notify('Wrong credentials', 'error')
    }
  }

  const logout = () => {
    window.localStorage.clear()
    setUser(null)
  }


  const tabs = [
    {
      nameId : 'overview',
      name : 'Übersicht',
      element : <Overview
        user={user}
        league={league}
        users={users}
        clubs={clubs}
      />
    },
    {
      nameId : 'squad',
      name : 'Kader',
      element : <Squad
        user={user}
        league={league}
        users={users}
        clubs={clubs}
      />
    },
    {
      nameId : 'market',
      name : 'Transfermarkt',
      inactive : true,
      element : <h2>Transfers...</h2>
    }
  ]

  return (
    <div>

      <h1>Kickbase Turbo</h1>

      <Notification message={notification.message} type={notification.type} />

      {user === null
        ? <LoginForm login={login} />
        : <>

          <section>
            <p>
              Logged in as {user.name}&nbsp;
              <button onClick={logout}>Logout</button>&nbsp;
            </p>
            <div>
              <label htmlFor='leagueId'>Liga: </label>
              <select id='leagueId' value={league} onChange={() => setLeague(event.target.value)}>
                {user.leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </section>

          <section>
            <nav className='buttons'>
              {tabs.map(t =>
                <button
                  key={t.nameId}
                  onClick={() => setTab(t.nameId)}
                  disabled={t.inactive}
                  className={t.nameId === tab ? 'selected' : ''}
                >
                  {t.name}
                </button>
              )}
            </nav>
          </section>

          {tabs.find(t => t.nameId === tab).element}
        </>
      }

    </div>
  )
}

export default App