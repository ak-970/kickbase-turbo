import axios from 'axios'
import { clubs, getMatchingId } from '../data/clubs'
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
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/`, config)
  return response.data.users.map(u => ({
    id : u.id,
    name : u.name,
    image : u.profile,
    points : u.pt || 0
  }))
}


const getCurrentMatchDay = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return response.data.md[0].n
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

const getLiveData = async (leagueId, user) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return !response.data.u.find(u => u.id === user)
    ? []
    : response.data.u.find(u => u.id === user).pl.map(pl => ({
      id : pl.id,
      club : pl.tid,
      firstName : pl.fn,
      lastName : pl.n,
      number : pl.nr,
      position : pl.p,
      points : pl.t
      // image : pl.profileBig,
      // linedUp : pl.dayStatus === 1,
      // injured : pl.status === 1,
      // totalPoints : pl.totalPoints,
      // averagePoints : pl.averagePoints,
      // marketValue : pl.marketValue,
      // marketValueTrend : pl.marketValueTrend
    }))
}


const getPlayersForMatchDay = async (leagueId, user, matchDay) => {
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
  const responses = await Promise.all([
    getUserPlayers(leagueId, user),
    getLiveData(leagueId, user)
  ])
  // console.log('responses', responses)
  // console.log('return', responses[0].map(pl => ({
  //   ...pl,
  //   plid : pl.id,
  //   liveData : responses[1],
  //   liveDataPlayer : responses[1].find(p => p.id === pl.id),
  //   points : !responses[1].find(p => p.id === pl.id) ? 0 : responses[1].find(p => p.id === pl.id).points
  // })))
  return responses[0].map(pl => ({
    ...pl,
    user,
    points : !responses[1].find(p => p.id === pl.id) ? 0 : responses[1].find(p => p.id === pl.id).points
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
  const responses = await Promise.all([
    axios.get(`${baseUrl}/players/${playerId}/points`, config),
    openligadbService.getMatchDays()
  ])

  const finishedMatches =
    responses[1]
      .map(d => ({
        day : d.day,
        match : d.matches.find(m => m.team1 === getMatchingId(clubId) ||  m.team2 === getMatchingId(clubId))
      }))
      .filter(d => d.match.isFinished)

  const pointHistory = finishedMatches.map(d => ({
    day : d.day,
    matchDateTime : d.match.matchDateTime,
    points : (
      responses[0].data.s.find(s => s.i === 24) &&
      responses[0].data.s.find(s => s.i === 24).m.find(m => m.d === d.day)
    )
      ? responses[0].data.s.find(s => s.i === 24).m.find(m => m.d === d.day).p
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
  getLive,
  getPlayersForMatchDay,
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