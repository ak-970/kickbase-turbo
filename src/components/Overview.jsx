import { useState, useEffect } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// components
import PlayerS from './PlayerS'
import Icon from './Icon'
import Carousel from './Carousel'

// utils
import formatDate from '../utils/formatDate'
// import formatNumber from '../utils/formatNumber'
import formatTime from '../utils/formatTime'


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
        <div className="time">{`${days[date.getDay()]} ${formatDate(date, 'D.M.YY')} ${formatTime(date, 'hh:mm')}`}</div>
        <div className="result">{`${match.team1.result} : ${match.team2.result}`}</div>
      </div>
      <div className="team-2">
        <img className="team-icon" src={clubs.find(c => c.openligaId === match.team2.id).icon} />
      </div>
    </div>
  )
}


const Overview = ({ user, league, users, clubs }) => {

  // use states
  // const [currentMatch, setCurrentMatch] = useState(false)
  // const [live, setLive] = useState(null)
  const [currentMatchDay, setCurrentMatchDay] = useState(0)
  const [matchDay, setMatchDay] = useState(0)
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

  useEffect(() => {
    kickbaseService
      .getCurrentMatchDay(league)
      .then(day => {
        setCurrentMatchDay(day)
        setMatchDay(day)
      })
  }, [])

  useEffect(() => {
    openligadbService
      .getMatchDayData(matchDay)
      .then(matches => {
        setCurrentMatchdayData(matches)
        // console.log('matches', matches)
      })
  }, [matchDay])

  useEffect(() => {
    // if (user !== null && users) {
    //   if(matchDay !== 0 && matchDay === currentMatchDay) {
    //     console.log('currentMatchDay')

    //     Promise.all(users.map(u => kickbaseService.getUserPlayersLive(league, u.id, matchDay)))
    //       .then(userPlayers => {
    //         console.log('userPlayers', userPlayers)
    //         setPlayersForMatchDay(userPlayers)
    //       })


    //   } else {
    //     console.log('not currentMatchDay')
    //     Promise.all(users.map(u => kickbaseService.getPlayersForMatchDay(league, u.id, matchDay)))
    //     .then((userPlayers) => setPlayersForMatchDay(userPlayers))
    //   }
    // }

    if (user !== null && users) {
      Promise.all(users.map(u => kickbaseService.getPlayersForMatchDay(league, u.id, matchDay)))
        .then((usersPlayers) => {
          if(matchDay !== 0 && matchDay === currentMatchDay) {
            Promise.all(users.map(u => kickbaseService.getUserPlayersLive(league, u.id, matchDay)))
              .then(usersPlayersLive => {
                const linedUpPlayers = usersPlayersLive.reduce((a, b) => [...a, ...b], []).filter(p => p.linedUp).map(p => p.id)
                setPlayersForMatchDay(usersPlayers.map(userPlayers => ({
                  ...userPlayers,
                  players : userPlayers.players.map(player => ({
                    ...player,
                    linedUp : linedUpPlayers.includes(player.id),
                    points : usersPlayersLive.flat(1).find(uPl => uPl.id === player.id).points
                  }))
                })))
                console.log('playersForMatchDay', playersForMatchDay)
              })
          } else {
            setPlayersForMatchDay(usersPlayers)
          }
        })
    }
  }, [user, users, league, matchDay])


  const playsInThisMatch = (player, match) =>
    [match.team1.id, match.team2.id].includes(clubs.find(c => c.id === player.club).openligaId)


  // console.log('playersForMatchDay', playersForMatchDay)

  return (!currentMatchdayData || playersForMatchDay.length < 1) ? <Icon type='spinner' /> : (
    <section className='overview'>
  
      <div>
        <label htmlFor='matchDay'>Spieltag: </label>
        <input id='matchDay' type='number' min={1} max={22} value={matchDay} onChange={() => setMatchDay(parseInt(event.target.value))}/>
      </div>

      <div className="teams">

        {users && <Carousel>        
          {users.map(u =>
            <div key={u.id} className="team">
              <div>
                <h3>{u.name}</h3>
                <p>
                  Gesamtpunkte: {u.points}<br/>
                  Spieltagspunkte: {
                    playersForMatchDay.find(p => p.user === u.id)
                      // ? playersForMatchDay.find(p => p.user === u.id).points()
                      ? playersForMatchDay.find(p => p.user === u.id).players.reduce((a, b) => (a + b.points), 0)
                      : 0
                  }
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
                    <PlayerS
                      key={player.id}
                      player={player}
                      clubIcon={clubs.find(c => c.id === player.club).icon}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </Carousel>} 

      </div>
    </section>
  )
}

export default Overview