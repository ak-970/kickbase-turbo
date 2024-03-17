import { useState, useRef, useEffect } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// components
import PlayerS from './PlayerS'
import Icon from './Icon'
import Carousel from './Carousel'
import MatchBanner from './MatchBanner'

// data
import { clubs } from '../data/clubs'


const Overview = ({ user, league, users }) => {

  // use states
  const [matchDay, setMatchDay] = useState(0)
  const [currentMatchDay, setCurrentMatchDay] = useState(0)
  const [liveUpdate, setLiveUpdate] = useState(0)
  const [matchdayMatches, setMatchdayMatches] = useState([])
  const [matchDayPlayers, setMatchDayPlayers] = useState([])
  const [alignMatches, setAlignMatches] = useState(true)


  // use refs
  const matchDayRef = useRef(0)


  // use effects

  useEffect(() => {
  // always get current value for matchDay with matchDayRef.current
    matchDayRef.current = matchDay;
  }, [matchDay]);


  useEffect(() => { const run = async () => {
  // initialize match day
    const day = await kickbaseService.getCurrentMatchDay(league)
    setCurrentMatchDay(day)
    setMatchDay(day)
  }; run(); }, [])


  useEffect(() => { const run = async () => {
  // get match and player data for selected matchday
    setMatchdayMatches([])
    if (user !== null && users && matchDay !== 0) {
      let matches = []
      if (matchDay === currentMatchDay) {
        matches = await kickbaseService.getLiveMatches(league)
      } else {
        matches = await openligadbService.getMatchDayMatches(matchDay)
      }
      setMatchdayMatches(matches)      

      // player data
      const usersPlayers = await Promise.all(
        users.map(u => kickbaseService.getMatchDayPlayers(league, u.id, matchDay))
      )
      setMatchDayPlayers(usersPlayers)
      console.log('usersPlayers', usersPlayers)

      initOrEndLiveUpdate()
    }
  }; run(); }, [user, users, matchDay, league])


  useEffect(() => { const run = async () => {
  // live update

    if (liveUpdate !== 0) {
      // console.log('live update...')

      // get live match and player data
      const [matchDayMatchesLive, ...usersPlayersLive] = await Promise.all(
        [kickbaseService.getLiveMatches(league)].concat(
          users.map(u => kickbaseService.getUserPlayersLive(league, u.id, matchDay))
        )
      )
      // console.log('matchDayMatchesLive', matchDayMatchesLive)
      // console.log('usersPlayersLive', usersPlayersLive)

      setMatchdayMatches(matchDayMatchesLive)

      const linedUpPlayers = usersPlayersLive.reduce((a, b) => [...a, ...b], []).filter(p => p.linedUp).map(p => p.id)
      setMatchDayPlayers(matchDayPlayers.map(userPlayers => ({
        ...userPlayers,
        players : userPlayers.players.map(player => ({
          ...player,
          linedUp : linedUpPlayers.includes(player.id),
          points : Math.max(player.points, usersPlayersLive.flat(1).find(uPl => uPl.id === player.id)?.points || 0)
        }))
      })))

      if (matchDayMatchesLive.find(m => m.now)) {
        setTimeout(initOrEndLiveUpdate, 3000)
      } else {
        setLiveUpdate(0)
      }
    }
  }; run(); }, [liveUpdate])


  
  const initOrEndLiveUpdate  = () => {
  // initialize live update if match is live
    if (matchDayRef.current === currentMatchDay) {
      setLiveUpdate(liveUpdate + 1)
    } else {
      setLiveUpdate(0)
    }
  }

  const allDataLoaded = () => matchdayMatches.length > 0 && matchDayPlayers.length > 0

  const playsInThisMatch = (player, match) =>
    [match.team1.id, match.team2.id].includes(player.club)

  const userPlayersInThisMatch = (user, match) => {
    const players = matchDayPlayers.find(p => p.user === user)
    return !players ? [] : players.players.filter(player => playsInThisMatch(player, match))
  }

  const maxPlayersInThisMatch = (match) => {
    const amounts = matchDayPlayers.map(user => userPlayersInThisMatch(user.user, match).length)
    return Math.max(...amounts)
  }
   





  console.log('matchDayPlayers', matchDayPlayers)

  return (
    <section className='overview'>
  
      <div>
        <label htmlFor='matchDay'>Spieltag: </label>
        <input id='matchDay' type='number' min={1} max={22} value={matchDay} onChange={() => setMatchDay(parseInt(event.target.value))}/>

        <button className='align-matches' onClick={() => setAlignMatches(!alignMatches)}><Icon type={alignMatches ? 'not-aligned' : 'aligned'}/></button>
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
                  {userPlayersInThisMatch(u.id, match).map(player =>
                    <PlayerS
                      key={player.id}
                      player={player}
                      clubIcon={clubs.find(c => c.id === player.club).icon}
                    />
                  )}
                  {alignMatches && [...Array(maxPlayersInThisMatch(match) - userPlayersInThisMatch(u.id, match).length).keys()].map(k =>
                    <PlayerS
                      key={k}
                      placeholder={true}
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