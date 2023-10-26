import { useState, useEffect } from 'react'

// services
import kickbaseService from '../services/kickbase'

const Squad = ({ user, league, users, clubs }) => {

  // use states
  const [keepers, setKeepers] = useState([])
  const [defense, setDefense] = useState([])
  const [midfield, setMidfield] = useState([])
  const [attack, setAttack] = useState([])


  useEffect(() => {
    kickbaseService
      .getLineupExtended(league)
      .then(lineup => {
        setKeepers(lineup.filter(l => l.position === 1))
        setDefense(lineup.filter(l => l.position === 2))
        setMidfield(lineup.filter(l => l.position === 3))
        setAttack(lineup.filter(l => l.position === 4))
      })
  }, [])


  return (
    <section className='squad'>
      <h2>Kader</h2>
      <div className='squad-list'>
        <div className='player-position keeper'>
          <h3>Tor</h3>
          {keepers.map(player =>
            <div className='player-item' key={player.id}>
              <div>{player.firstName} {player.lastName}</div>
              <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
              <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
            </div>
          )}
        </div>
        <div className='player-position midfield'>
          <h3>Abwehr</h3>
          {midfield.map(player =>
            <div className='player-item' key={player.id}>
              <div>{player.firstName} {player.lastName}</div>
              <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
              <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
            </div>
          )}
        </div>
        <div className='player-position midfield'>
          <h3>Mittelfeld</h3>
          {midfield.map(player =>
            <div className='player-item' key={player.id}>
              <div>{player.firstName} {player.lastName}</div>
              <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
              <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
            </div>
          )}
        </div>
        <div className='player-position attack'>
          <h3>Angriff</h3>
          {attack.map(player =>
            <div className='player-item' key={player.id}>
              <div>{player.firstName} {player.lastName}</div>
              <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
              <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Squad