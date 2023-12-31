import axios from 'axios'
// import { clubs, getMatchingId } from '../data/clubs'
import openligadbService from './openligadb'

const baseUrl = 'https://api.kickbase.com'

let token = null
const setToken = newToken => {
  token = `bearer ${newToken}`
}


// const getOverview = async (leagueId) => {
//   const config = {
//     headers: { Authorization: token }
//   }
//   const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
//   return response.data
// }


const getUsers = async (leagueId) => {
  if (leagueId === 0) return [] 

  try {
    const config = {
      headers: { Authorization: token }
    }
    const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/`, config)
  
    console.log('response', response)
  
    if (response.status === 403) {
      console.log('403')
      return
    } else {
      return response.data.users.map(u => ({
        id : u.id,
        name : u.name,
        image : u.profile,
        points : u.pt || 0
      }))
    }
  } catch(exception) {
    console.log(exception)
    console.log(exception.response.status)
    if (exception.response.status) {
      window.localStorage.clear()
      return 'logout'
    }
  }
}


const getCurrentMatchDay = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return response.data.md[0].n
}

const isMatchLive = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)

  let isLive = false

  response.data.md.forEach(matchDay => {
    const now = new Date()
    const start = new Date(matchDay.d)
    const minute = matchDay.m[0].ts || 0

    // if (start < now) {
    //   console.log('----------------')
    //   console.log('now', now)
    //   console.log('start', start)
    //   console.log('minute', minute)
    //   console.log('start < now', start < now)
    //   console.log('minute < 90', minute < 90)
    //   console.log('start.getTime()', start.getTime())
    //   console.log('start.setTime(start.getTime() + (minute + 20) * 60 * 1000)', start.setTime(start.getTime() + (minute + 20) * 60 * 1000))
    //   console.log('start.setTime(start.getTime() + (minute + 20) * 60 * 1000) > now.getTime()', start.setTime(start.getTime() + (minute + 20) * 60 * 1000) > now.getTime() )
    // }

    if (
      start < now &&    // has started
      (
        minute < 90 || // has not reached minimum of minutes (necessary for half time break)
        start.setTime(start.getTime() + (minute + 30) * 60 * 1000) > now.getTime()   // has not ended yet
      )
    ) {
      isLive = true
    }
  })

  return isLive
}


const getLive = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return response.data.u.map(u => ({
    user : u.id,
    points : u.pl.reduce((a, b) => a + b.t, 0),
    players : u.pl.map( pl => ({
      id : pl.id,
      club : pl.tid,
      firstName : pl.fn,
      lastName : pl.n,
      number : pl.nr,
      points : pl.t,
      position : pl.p
    }))
  }))
}

const getLiveMatches = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  let matches = []
  response.data.md.forEach(matchDate => {
    matchDate.m.forEach(match => {

      const now = new Date()
      const start = new Date(matchDate.d)
      const minute = match.ts || 0

      matches.push({
        id : match.id,
        dateTime : matchDate.d,
        now : start < now &&    // has started
          (
            minute < 90 || // has not reached minimum of minutes (necessary for half time break)
            start.setTime(start.getTime() + ((minute + 30) * 60 * 1000)) > now.getTime()   // has not ended yet        
          ),
        started : start < now,
        minute,
        team1 : {
          id : match.t1i,
          name : match.t1n,
          result : match.t1s
        },
        team2 : {
          id : match.t2i,
          name : match.t2n,
          result : match.t2s
        }
      })
    })
  })
  return matches

  // return response.data.md.map(match => ({
  //   start : match.d,
  //   id : match.m[0].id,
  //   team1 : {
  //     id : match.m[0].t1i,
  //     result : match.m[0].t1s
  //   },
  //   team2 : {
  //     id : match.m[0].t12,
  //     result : match.m[0].t2s
  //   }
  // }))
}

const getLivePlayers = async (leagueId, user) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return !response.data.u.find(u => u.id === user) ? []
    : response.data.u.find(u => u.id === user).pl.map(pl => ({
      id : pl.id,
      club : pl.tid,
      firstName : pl.fn,
      lastName : pl.n,
      number : pl.nr,
      position : pl.p,
      points : pl.t
    }))
}


const getMatchDayPlayers = async (leagueId, user, matchDay) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/${user}/players?matchDay=${matchDay}`, config)
  return {
    user,
    points : response.data.players
      .filter(pl => pl.dayStatus === 1)
      .reduce((a, b) => a + ((response.data.currentDay >= response.data.day && b.totalPoints && response.data.players.filter(p => p.id !== '0').length > 0) ? b.totalPoints : 0), 0),
    // currentDay : response.data.currentDay,
    day : response.data.day,
    players : response.data.players.filter(p => p.id !== '0').map(pl => ({
      id : pl.id,
      club : pl.teamId,
      firstName : pl.firstName,
      lastName : pl.lastName,
      number : pl.number,
      points : (pl.dayPoints || 0),
      position : pl.position,
      injured : pl.status === 1,
      image : pl.profileBig,
      linedUp : pl.dayStatus === 1
    }))
  }
}


// const getLineup = async (leagueId) => {
//   const config = {
//     headers: { Authorization: token }
//   }
//   const response = await axios.get(`${baseUrl}/leagues/${leagueId}/lineup`, config)
//   return response.data.players.filter(p => p !== null)
// }


// const getLineupExtended = async (leagueId) => {
//   const config = {
//     headers: { Authorization: token }
//   }
//   const response = await axios.get(`${baseUrl}/leagues/${leagueId}/lineupex`, config)
//   // return response.data
//   return response.data.players.map(pl => ({
//     id : pl.id,
//     club : pl.teamId,
//     firstName : pl.firstName,
//     lastName : pl.lastName,
//     number : pl.number,
//     position : pl.position,
//     image : pl.profileBig,
//     linedUp : pl.dayStatus === 1,
//     totalPoints : pl.totalPoints,
//     averagePoints : pl.averagePoints,
//     marketValue : pl.marketValue,
//     marketValueTrend : pl.marketValueTrend
//   }))
// }


const getUserPlayers = async (leagueId, user) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/${user}/players`, config)
  return response.data.players.map(pl => ({
    id : pl.id,
    club : pl.teamId,
    firstName : pl.firstName,
    lastName : pl.lastName,
    number : pl.number,
    position : pl.position,
    image : pl.profileBig,
    linedUp : pl.dayStatus === 1,
    injured : pl.status === 1,
    totalPoints : pl.totalPoints,
    averagePoints : pl.averagePoints,
    marketValue : pl.marketValue,
    marketValueTrend : pl.marketValueTrend
  }))
}


const getUserPlayersLive = async (leagueId, user) => {
  const [userPlayers, livePlayers] = await Promise.all([
    getUserPlayers(leagueId, user),
    getLivePlayers(leagueId, user)
  ])
  return userPlayers.map(pl => ({
    ...pl,
    user,
    points : !livePlayers.find(p => p.id === pl.id) ? 0 : livePlayers.find(p => p.id === pl.id).points
  }))
}


const getUserPlayersExtended = async (leagueId, user) => {
  const players = await getUserPlayers(leagueId, user)
  const playerPointHistory = await Promise.all(
    players.map(p => getPlayerPointHistory(p.id, p.club))
  )
  const playerMarketValueHistory = await Promise.all(
    players.map(p => getPlayerMarketValueHistory(leagueId, p.id))
  )
  return players.map(p => ({
    ...p,
    pointHistory : playerPointHistory.find(h => h.id === p.id).pointHistory,
    marketValueHistory : playerMarketValueHistory.find(h => h.id === p.id).marketValueHistory
  }))
}



const getPlayerPointHistory = async (playerId, clubId = 0) => {
  const config = {
    headers: { Authorization: token }
  }
  const [points, matchDays] = await Promise.all([
    axios.get(`${baseUrl}/players/${playerId}/points`, config),
    openligadbService.getMatchDays()
  ])

  const finishedMatches =
    matchDays
      .map(d => ({
        day : d.day,
        match : d.matches.find(m => m.team1 === clubId ||  m.team2 === clubId)
      }))
      .filter(d => d.match.isFinished)

  const pointHistory = finishedMatches.map(d => ({
    day : d.day,
    matchDateTime : d.match.matchDateTime,
    points : (
      points.data.s.find(s => s.i === 24) &&
      points.data.s.find(s => s.i === 24).m.find(m => m.d === d.day)
    )
      ? points.data.s.find(s => s.i === 24).m.find(m => m.d === d.day).p
      : null
  }))

  return {
    id : playerId,
    pointHistory : pointHistory.map((h, i) => ({
      ...h,
      pointsTotal : pointHistory.slice(0, i + 1).reduce((a, b) => (a + (b.points || 0)), 0),
      pointsAverageAllMatches : Math.round(
        (pointHistory.slice(0, i + 1).reduce((a, b) => (a + (b.points || 0)), 0)) /
        h.day
        || 0
      ),
      pointsAveragePlayedMatches : Math.round(
        ((pointHistory.slice(0, i + 1).reduce((a, b) => (a + (b.points || 0)), 0)) /
        pointHistory.slice(0, i + 1).filter(d => d.points !== null).length)
        || 0
      )
    }))
  }
}

const getPlayerMarketValueHistory = async (leagueId, player) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/players/${player}/stats`, config)
  return {
    id : player,
    marketValueHistory : response.data.marketValues.map(m => ({
      day : m.d,
      marketValue : m.m
    }))
  }
}


const getMarket = async (leagueId, user) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/market`, config)
  return response.data.players.filter(pl => user === (pl.userId || 'kickbase')).sort((a, b) => (a.expiry - b.expiry)).map(pl => ({
    id : pl.id,
    club : pl.teamId,
    firstName : pl.firstName,
    lastName : pl.lastName,
    number : pl.number,
    position : pl.position,
    totalPoints : pl.totalPoints,
    averagePoints : pl.averagePoints,
    injured : pl.status === 1,
    marketValue : pl.marketValue,
    marketValueTrend : pl.marketValueTrend,
    price : pl.price,
    expiry : pl.expiry,
    user : pl.userId || 'kickbase',
    offers : !pl.offers ? [] : pl.offers.map(o => ({
      id : o.id,
      price : o.price,
      dateOffer : o.date,
      dateExpiry : o.validUntilDate
    }))
  }))
}


const getMarketExtended = async (leagueId, user) => {
  const players = await getMarket(leagueId, user)
  const playerPointHistory = await Promise.all(players.map(p => getPlayerPointHistory(p.id, p.club)))
  const playerMarketValueHistory = await Promise.all(players.map(p => getPlayerMarketValueHistory(leagueId, p.id)))
  return players.map(p => ({
    ...p,
    pointHistory : playerPointHistory.find(h => h.id === p.id).pointHistory,
    marketValueHistory : playerMarketValueHistory.find(h => h.id === p.id).marketValueHistory
  }))
}



// const getFeed = async (leagueId) => {
//   const config = {
//     headers: { Authorization: token }
//   }
//   const response = await axios.get(`${baseUrl}/leagues/${leagueId}/feed`, config)
//   const types = [
//     { id : '2', name : 'meta.s.. hat meta.p.. an Kickbase verkauft' },
//     { id : '3', name : 'meta.p.. ist auf dem Transfermarkt' },
//     { id : '12', name : 'meta.b.. hat meta.p.. von Kickbase gekauft' }
//   ]
//   return response.data
// }


const getMyBudget = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/me`, config)
  return response.data.budget
}




export default {
  setToken,
  // getOverview,
  getUsers,
  getCurrentMatchDay,
  isMatchLive,
  getLive,
  getLiveMatches,
  getMatchDayPlayers,
  // getLineup,
  // getLineupExtended,
  getUserPlayers,
  getUserPlayersLive,
  getUserPlayersExtended,
  // getPlayerPointHistory,
  // getPlayerMarketValueHistory,
  getMarket,
  getMarketExtended,
  getMyBudget
}