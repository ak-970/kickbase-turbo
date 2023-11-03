import { useState, useEffect, useRef } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// components
import PlayerL from './PlayerL'
import Icon from './Icon'

// data
import { positions } from '../data/positions'

// utils
import formatDate from '../utils/formatDate'
import formatNumber from '../utils/formatNumber'
import formatTime from '../utils/formatTime'


const Budget = ({ user, league, users, clubs }) => {

  // use states
  const [budget, setBudget] = useState(0)
  const [userBudget, setUserBudget] = useState(user.id)
  const [userPlayers, setUserPlayers] = useState([])
  // const [loadedData, setLoadedData] = useState(false)

  // useEffect(() => {
  //   setUserBudget(user.id)
  // }, [league])

  useEffect(() => {
    // setLoadedData(false)
    kickbaseService
      .getMyBudget(league)
      .then(b => {
        console.log('budget', b)
        setBudget(b)
        // setLoadedData(true)
      })
  }, [league, userBudget])

  useEffect(() => {
    // setLoadedData(false)
    Promise.all([
      kickbaseService.getUserPlayers(league, user.id),
      kickbaseService.getMarket(league, user.id)
    ])
      .then(responses => {
        console.log('responses', responses)
        setUserPlayers(responses[0].map(p => ({
          ...p,
          offer : (
            responses[1].find(m => m.id === p.id)
              && responses[1].find(m => m.id === p.id).offers
              && responses[1].find(m => m.id === p.id).offers.length > 0
            )
              ? Math.max(responses[1].find(m => m.id === p.id).offers.map(o => o.price))
              : p.marketValue
        })))
        console.log('userPlayers', userPlayers)
        // setBudget(b)
        // setLoadedData(true)
      })
  }, [league, userBudget])

  const budgetWithTeamOnly = () =>
    userPlayers.reduce((a, b) => (b.linedUp ? a : a + b.offer), budget)

  const marketValueTeam = () =>
    userPlayers.reduce((a, b) => (!b.linedUp ? a : a + b.marketValue), 0)

  return (
    <section className='budget'>
      {/* <div className='buttons'>
        {users && users.map(u =>
          <button key={u.id} className={u.id === userBudget ? 'selected' : ''} onClick={() => setUserBudget(u.id)}>{u.name}</button>
        )}
      </div> */}
      <div>
        <p>
          {user.id !== userBudget ? 'Geschätztes ' : ''} Budget:&nbsp;
          <b className={budget < 0 ? 'bad' : 'good'}>€ {formatNumber(budget)}</b>
        </p>
        <p>
          {user.id !== userBudget ? 'Geschätztes ' : ''} Budget nach Verkauf von nicht aufgestellten Spielerinnen:&nbsp;
          <b className={budgetWithTeamOnly() < 0 ? 'bad' : 'good'}>€ {formatNumber(budgetWithTeamOnly())}</b>
        </p>
        <p>
          {user.id !== userBudget ? 'Geschätztes ' : ''} Marktwert von allen aufgestellten Spielerinnen zusammen:&nbsp;
          <b>€ {formatNumber(marketValueTeam())}</b>
        </p>
        {/* <div>
          <h3>Transfers</h3>
          ...
        </div> */}
        {/* <div className='player-item-group player-l'>
          {!loadedData
            ? <Icon type='spinner' />
            : market.filter(p => p.user === userBudget).map(player =>
              <PlayerL key={player.id} player={player} />
          )}
        </div> */}
      </div>
    </section>
  )
}

export default Budget