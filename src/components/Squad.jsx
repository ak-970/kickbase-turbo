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
import { formatNumber } from 'chart.js/helpers'


const Squad = ({ user, league, users, clubs }) => {

  // use states
  const [players, setPlayers] = useState([])
  const [userSquad, setUserSquad] = useState(user.id)
  const [loadedData, setLoadedData] = useState(false)

  useEffect(() => {
    setUserSquad(user.id)
  }, [league])

  useEffect(() => {
    setLoadedData(false)
    kickbaseService
      .getUserPlayersExtended(league, userSquad)
      .then(lineup => {
        console.log('userPlayersExtended', lineup)
        setPlayers(lineup)
        setLoadedData(true)
      })
  }, [league, userSquad])

  console.log('players', players)
  // console.log('users', users)
  // console.log('userSquad', userSquad)

  return (
    <section className='squad'>
      {/* <h2>Kader</h2> */}
      <div className='buttons'>
        {users && users.map(u =>
          <button key={u.id} className={u.id === userSquad ? 'selected' : ''} onClick={() => setUserSquad(u.id)}>{u.name}</button>
        )}
      </div>
      <p>
        Durschnittspunkte (alle Spiele) von allen aufgestellten Spielerinnen zusammen: <b>{
          // formatNumber(players.filter(p => p.linedUp).reduce((a, b) => (a + b.averagePoints), 0))
          formatNumber(players.filter(p => p.linedUp).reduce((a, b) => (a + b.pointHistory.slice(-1)[0].pointsAveragePlayedMatches), 0))
        }</b>
      </p>
      <div className='player-list squad'>
        {!loadedData
          ? <Icon type='spinner' />
          : positions.map(position =>
            <div key={position.id} className='player-item-group player-l'>
              <h3>{position.name}</h3>
              {players.filter(p => p.position === position.id).map(player =>
                <PlayerL key={player.id} player={player} />
              )}
            </div>
          )
        }
      </div>
    </section>
  )
}

export default Squad