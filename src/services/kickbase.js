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
    totalPoints : pl.totalPoints,
    averagePoints : pl.averagePoints,
    marketValue : pl.marketValue,
    marketValueTrend : pl.marketValueTrend
  }))
}


const getUserPlayersExtended = async (leagueId, user) => {
  const players = await getUserPlayers(leagueId, user)
  const playerPointHistory = await Promise.all(players.map(p => getPlayerPointHistory(p.id)))
  const playerMarketValueHistory = await Promise.all(players.map(p => getPlayerMarketValueHistory(leagueId, p.id)))
  return players.map(p => ({
    ...p,
    pointHistory : playerPointHistory.find(h => h.id === p.id).pointHistory,
    marketValueHistory : playerMarketValueHistory.find(h => h.id === p.id).marketValueHistory
  }))
}



const getPlayerPointHistory = async (player) => {
  const config = {
    headers: { Authorization: token }
  }
  const responses = await Promise.all([
    axios.get(`${baseUrl}/players/${player}/points`, config),
    openligadbService.getMatchDays()
  ])
  // console.log('clubs.find...', responses[0].data.s.map(s => s.m.map(m => ({
  //   matchDateTime : responses[1].find(md => md.day === m.d).matches.find(m =>
  //     m => m.team1 === getMatchingId(m.t1i) ||  m.team1 === getMatchingId(m.t2i)
  //   ).matchDateTime
  // }))))
  return {
    id : player,
    pointHistory : responses[0].data.s.map(s => ({
      matches : s.m.map(m => ({
        season : {
          id : s.i,
          name : s.t
        },
        day : m.d,
        matchDateTime : s.i === 23 ? '2022' : responses[1].find(md => md.day === m.d).matches.find(m =>
          m => m.team1 === getMatchingId(m.t1i) ||  m.team1 === getMatchingId(m.t2i)
        ).matchDateTime,
        points : m.p,
        // team1 : {
        //   id : m.t1i,
        //   result : m.t1s
        // },
        // team2 : {
        //   id : m.t2i,
        //   result : m.t2s
        // }
      }))
    })).map(s => s.matches).flat(1)
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
  return response.data.players.filter(pl => user === (pl.userId || 'kickbase')).map(pl => ({
    id : pl.id,
    club : pl.teamId,
    firstName : pl.firstName,
    lastName : pl.lastName,
    number : pl.number,
    position : pl.position,
    totalPoints : pl.totalPoints,
    averagePoints : pl.averagePoints,
    marketValue : pl.marketValue,
    marketValueTrend : pl.marketValueTrend,
    price : pl.price,
    user : pl.userId || 'kickbase',
    offers : !pl.offers ? [] : pl.offers.map(o => ({
      id : o.id,
      price : o.price
    }))
  }))
}


const getMarketExtended = async (leagueId, user) => {
  const players = await getMarket(leagueId, user)
  const playerPointHistory = await Promise.all(players.map(p => getPlayerPointHistory(p.id)))
  const playerMarketValueHistory = await Promise.all(players.map(p => getPlayerMarketValueHistory(leagueId, p.id)))
  return players.map(p => ({
    ...p,
    pointHistory : playerPointHistory.find(h => h.id === p.id).pointHistory,
    marketValueHistory : playerMarketValueHistory.find(h => h.id === p.id).marketValueHistory
  }))
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
  getUserPlayersExtended,
  // getPlayerPointHistory,
  // getPlayerMarketValueHistory,
  // getMarket,
  getMarketExtended
}