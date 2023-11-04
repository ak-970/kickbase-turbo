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
import userEvent from '@testing-library/user-event'

// data
import { clubs, getClubIcon } from '../data/clubs'


const MatchBanner = ({ match }) => {
  const matchStatus = match.started && !match.now ? 'finished' : (match.now ? 'now' : 'pending')
  const date = new Date(match.dateTime)
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  return (
    <div className={`match-banner ${matchStatus}`}>
      <div className="team-1">
        <img className="team-icon" src={getClubIcon(match.team1.id)} />
        
      </div>
      <div className="info">
        <div className="time">{`${days[date.getDay()]} ${formatDate(date, 'D.M.YY hh:mm')}`}</div>
        <div className="result">
          {`${match.team1.result} : ${match.team2.result}`}
          {match.now && <div className='live'>{`${match.minute}'`}</div>}
        </div>
      </div>
      <div className="team-2">
        <img className="team-icon" src={getClubIcon(match.team2.id)} />
      </div>
    </div>
  )
}


const Overview = ({ user, league, users }) => {

  // use states
  const [matchDay, setMatchDay] = useState(0)
  const [currentMatchDay, setCurrentMatchDay] = useState(0)
  // const [isLive, setIsLive] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState(0)
  const [matchdayMatches, setMatchdayMatches] = useState([])
  const [matchDayPlayers, setMatchDayPlayers] = useState([])



  // initialize match day
  useEffect(() => { const run = async () => {
    // console.log('initialize match day...')
    const day = await kickbaseService.getCurrentMatchDay(league)
    setCurrentMatchDay(day)
    setMatchDay(day)
  }; run(); }, [])



  // get match and player data for selected matchday
  useEffect(() => { const run = async () => {
    setMatchdayMatches([])
    if (user !== null && users && matchDay !== 0) {

      // match data
      // const [matches, isMatchLive] = await Promise.all([
      //   matchDay === currentMatchDay ? kickbaseService.getLiveMatches(league) : openligadbService.getMatchDayMatches(matchDay),
      //   kickbaseService.isMatchLive(league)
      // ])
      let matches = []
      if (matchDay === currentMatchDay) {
        matches = await kickbaseService.getLiveMatches(league)
      } else {
        matches = await openligadbService.getMatchDayMatches(matchDay)
      }
      // const matches = await matchDay === currentMatchDay ? kickbaseService.getLiveMatches(league) : openligadbService.getMatchDayMatches(matchDay)
      // console.log('matches', matches)
      setMatchdayMatches(matches)
      // console.log('isMatchLive', isMatchLive)
      // setIsLive(isMatchLive)
      

      // player data
      const usersPlayers = await Promise.all(
        users.map(u => kickbaseService.getMatchDayPlayers(league, u.id, matchDay))
      )
      setMatchDayPlayers(usersPlayers)
      console.log('usersPlayers', usersPlayers)


      // initialize live update if match is live
      if (matchDay === currentMatchDay) {
        setLiveUpdate(liveUpdate + 1)
      }

    }
  }; run(); }, [user, users, matchDay, league])



  // live update
  useEffect(() => { const run = async () => {
    // console.log('requested live update...')
    if (liveUpdate !== 0) {
      console.log('live update...')

      // get live match and player data
      const [matchDayMatchesLive, ...usersPlayersLive] = await Promise.all(
        [kickbaseService.getLiveMatches(league)].concat(
          users.map(u => kickbaseService.getUserPlayersLive(league, u.id, matchDay))
        )
      )
      console.log('matchDayMatchesLive', matchDayMatchesLive)
      console.log('usersPlayersLive', usersPlayersLive)

      setMatchdayMatches(matchDayMatchesLive)

      const linedUpPlayers = usersPlayersLive.reduce((a, b) => [...a, ...b], []).filter(p => p.linedUp).map(p => p.id)
      setMatchDayPlayers(matchDayPlayers.map(userPlayers => ({
        ...userPlayers,
        players : userPlayers.players.map(player => ({
          ...player,
          linedUp : linedUpPlayers.includes(player.id),
          points : usersPlayersLive.flat(1).find(uPl => uPl.id === player.id)
            ? usersPlayersLive.flat(1).find(uPl => uPl.id === player.id).points
            : 0
        }))
      })))

      if (matchDayMatchesLive.find (m => m.now)) {
        setTimeout(() => {
          setLiveUpdate(liveUpdate + 1)
        }, 3000)
      } else {
        setLiveUpdate(0)
        // setIsLive(false)
      }
    }
  }; run(); }, [liveUpdate])
  



  const allDataLoaded = () => matchdayMatches.length > 0 && matchDayPlayers.length > 0

  const playsInThisMatch = (player, match) =>
    [match.team1.id, match.team2.id].includes(player.club)
    


  // console.log('matchDayPlayers', matchDayPlayers)

  return (
    <section className='overview'>
  
      <div>
        <label htmlFor='matchDay'>Spieltag: </label>
        <input id='matchDay' type='number' min={1} max={22} value={matchDay} onChange={() => setMatchDay(parseInt(event.target.value))}/>
      </div>

      {!allDataLoaded() ? <Icon type='spinner' /> : <div className="teams">

        {users && <Carousel>
          {users.map(u =>
            <div key={u.id} className="team">
              <div>
                <h3>{u.name}</h3>
                <p>
                  Gesamtpunkte: {u.points}<br/>
                  Spieltagspunkte: {
                    matchDayPlayers.find(p => p.user === u.id)
                      // ? playersForMatchDay.find(p => p.user === u.id).points()
                      ? matchDayPlayers.find(p => p.user === u.id).players.reduce((a, b) => (a + b.points), 0)
                      : 0
                  }
                </p>
              </div>

              {matchdayMatches.map(match =>
                <div key={match.id} className="match-info">
                  <MatchBanner
                    match={match}
                    clubs={clubs}
                  />
                  {matchDayPlayers.find(p => p.user === u.id) &&
                  matchDayPlayers.find(p => p.user === u.id).players
                    .filter(player => playsInThisMatch(player, match)).map(player =>
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

      </div>}

    </section>
  )
}

export default Overview