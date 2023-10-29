import { useState, useEffect, useRef } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// // utils
// import formatDate from '../utils/formatDate'

// components
import PlayerL from './PlayerL'
import Icon from './Icon'

// data
import { positions } from '../data/positions'


const Market = ({ user, league, users, clubs }) => {

  // use states
  const [market, setMarket] = useState([])
  const [userMarket, setUserMarket] = useState(user.id)
  const [loadedData, setLoadedData] = useState(false)

  useEffect(() => {
    setUserMarket(user.id)
  }, [league])

  useEffect(() => {
    setLoadedData(false)
    kickbaseService
      .getMarketExtended(league, userMarket)
      .then(m => {
        console.log('market', m)
        setMarket(m)
        setLoadedData(true)
      })
    // kickbaseService
    //   .getUserPlayersExtended(league, userSquad)
    //   .then(lineup => {
    //     console.log('userPlayersExtended', lineup)
    //     setPlayers(lineup)
    //     setLoadedData(true)
    //   })
  }, [league, userMarket])

  // console.log('players', players)
  // console.log('users', users)
  // console.log('userSquad', userSquad)

  return (
    <section className='market'>
      <div className='buttons'>
      <button className={'kickbase' === userMarket ? 'selected' : ''} onClick={() => setUserMarket('kickbase')}>Kickbase</button>
        {users && users.map(u =>
          <button key={u.id} className={u.id === userMarket ? 'selected' : ''} onClick={() => setUserMarket(u.id)}>{u.name}</button>
        )}
      </div>
      <div className='player-list market'>
        <div className='player-item-group player-l'>
          {!loadedData
            ? <Icon type='spinner' />
            : market.filter(p => p.user === userMarket).map(player =>
              <PlayerL key={player.id} player={player} />
          )}
        </div>
      </div>
    </section>
  )
}

export default Market