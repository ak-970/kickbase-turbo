import { useState, useEffect, useRef } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// // utils
// import formatDate from '../utils/formatDate'

// components
import PlayerL from './PlayerL'

// data
import { positions } from '../data/positions'


const Squad = ({ user, league, users, clubs }) => {

  // use states
  const [players, setPlayers] = useState([])

  useEffect(() => {
    kickbaseService
      .getUserPlayersExtended(league, user.id)
      .then(lineup => {
        console.log('userPlayersExtended', lineup)
        setPlayers(lineup)
      })
  }, [league])

  console.log('players', players)

  return (
    <section className='squad'>
      <h2>Kader</h2>
      <div className='player-list squad'>
        {positions.map(position =>
          <div key={position.id} className='player-item-group player-l'>
            <h3>{position.name}</h3>
            {players.filter(p => p.position === position.id).map(player =>
              <PlayerL key={player.id} player={player} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Squad