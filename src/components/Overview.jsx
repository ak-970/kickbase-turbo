import { useState, useEffect } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

const Player = ({ player, clubIcon }) =>
  <div className="players">
    <div className="player">
      <img className="team-icon" src={clubIcon} />
      {player.firstName} {player.lastName}
    </div>
    <div className="points">{player.points}</div>
  </div>


const MatchBanner = ({ match, clubs }) => {
  const matchStatus = match.finished ? 'finished' : 'now-pending'
  const date = new Date(match.dateTime)
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return (
    <div className={`match-banner ${matchStatus}`}>
      <div className="team-1">
        <img className="team-icon" src={clubs.find(c => c.openligaId === match.team1.id).icon} />
      </div>
      <div className="info">
        <div className="time">{`${days[date.getDay()]} ${date.getDate()}.${date.getMonth()}.${date.getFullYear() - 2000} ${date.getHours()}:${date.getMinutes() === 0 ? '00' : date.getMinutes()}`}</div>
        <div className="result">{`${match.team1.result} : ${match.team2.result}`}</div>
      </div>
      <div className="team-2">
        <img className="team-icon" src={clubs.find(c => c.openligaId === match.team2.id).icon} />
      </div>
    </div>
  )
}


const Overview = ({ user, users, clubs }) => {

  // use states
  // const [league, setLeague] = useState(user.leagues[0])
  const [currentMatch, setCurrentMatch] = useState(false)
  const [live, setLive] = useState(null)
  const [updateOverview, setUpdateOverview] = useState(0)
  const [currentMatchdayData, setCurrentMatchdayData] = useState(null)

  useEffect(() => {
    user !== null && kickbaseService
      .getLive()
      .then(l => {
        setLive(l)
        console.log('live', l)
      })
  }, [user])


  useEffect(() => {
    openligadbService
      .getCurrentMatchDayData()
      .then(matches => {
        setCurrentMatchdayData(matches)
        console.log('matches', matches)
      })
  }, [updateOverview])



  const playsInThisMatch = (player, match) =>
    [match.team1.id, match.team2.id].includes(clubs.find(c => c.id === player.club).openligaId)



  return (!currentMatchdayData) ? <p>keine Daten</p> : (
    <section className='overview'>
      {/* <h2>Overview <button onClick={handleUpdate}>update</button></h2> */}
      <h2>Overview</h2>
      {/* <div className='buttons'>
        <h3>Liga</h3>
        {user.leagues.map(l => <button key={l.id} onClick={() => setLeague(l.id)}>{l.name}</button>)}
      </div> */}
      <div className="teams">
        {users.map(u =>
          <div key={u.id} className="team">
            <h3>{u.name}<br/>{live.find(t => t.user === u.id).points}</h3>

            {currentMatchdayData && currentMatchdayData.map(match =>
              <div key={match.id} className="match-info">
                <MatchBanner
                  match={match}
                  clubs={clubs}
                />
                {live.find(t => t.user === u.id).players.filter(player => playsInThisMatch(player, match)).map(player =>
                  <Player
                    key={player.id}
                    player={player}
                    clubIcon={clubs.find(c => c.id === player.club).icon}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Overview