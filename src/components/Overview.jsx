import { useState, useEffect } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

const Player = ({ player, clubIcon }) =>
  <div className={`player-item ${player.linedUp ? 'lined-up' : 'not-lined-up'}`}>
    <div className='player'>
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
  // const [currentMatch, setCurrentMatch] = useState(false)
  // const [live, setLive] = useState(null)
  const [matchDay, setMatchDay] = useState(6)
  const [playersForMatchDay, setPlayersForMatchDay] = useState([])
  // const [updateOverview, setUpdateOverview] = useState(true)
  const [currentMatchdayData, setCurrentMatchdayData] = useState(null)

  // useEffect(() => {
  //   user !== null && kickbaseService
  //     .getLive()
  //     .then(l => {
  //       setLive(l)
  //       console.log('live', l)
  //     })
  // }, [user])

  // useEffect(() => {
  //   openligadbService
  //     .getCurrentMatchDay()
  //     .then(day => {
  //       setMatchDay(day)
  //       console.log('day', day)
  //     })
  // }, [])

  useEffect(() => {
    openligadbService
      .getMatchDayData(matchDay)
      .then(matches => {
        setCurrentMatchdayData(matches)
        // console.log('matches', matches)
      })
  }, [matchDay])

  useEffect(() => {
    if (user !== null && users) {
      Promise.all(users.map(u => kickbaseService.getPlayersForMatchDay(u.id, matchDay)))
        .then((players) => {
          setPlayersForMatchDay(players)
          // console.log('playersForMatchDay', players)
          // setUpdateOverview(!updateOverview)
        })
    }
  }, [user, users, matchDay])


  const playsInThisMatch = (player, match) => {
    // console.log('player', player)
    // console.log('match', match)
    // console.log('clubs.find(c => c.id === player.club)', clubs.find(c => c.id === player.club))

    return [match.team1.id, match.team2.id].includes(clubs.find(c => c.id === player.club).openligaId)
    // return false
  }




  return (!currentMatchdayData || playersForMatchDay.length < 1) ? <p>keine Daten</p> : (
    <section className='overview'>
      {/* <h2>Overview <button onClick={() => setUpdateOverview(!updateOverview)}>update</button></h2> */}
      <h2>Overview</h2>
      <div>
        <label htmlFor='matchDay'>Spieltag: </label>
        <input id='matchDay' type='number' min={1} max={22} value={matchDay} onChange={() => setMatchDay(event.target.value)}/>
      </div>
      {/* <div className='buttons'>
        <h3>Liga</h3>
        {user.leagues.map(l => <button key={l.id} onClick={() => setLeague(l.id)}>{l.name}</button>)}
      </div> */}
      <div className="teams">
        {users && users.map(u =>
          <div key={u.id} className="team">
            <div>
              <h3>{u.name}</h3>
              <p>
                Gesamt: {u.points}<br/>
                Spieltag: {playersForMatchDay.find(p => p.user === u.id).points}
              </p>
            </div>

            {currentMatchdayData && currentMatchdayData.map(match =>
              <div key={match.id} className="match-info">
                <MatchBanner
                  match={match}
                  clubs={clubs}
                />
                {playersForMatchDay.find(p => p.user === u.id)
                && playersForMatchDay.find(p => p.user === u.id).players.filter(player => playsInThisMatch(player, match)).map(player =>
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