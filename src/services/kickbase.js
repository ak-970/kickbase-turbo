import axios from 'axios'

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

const getPlayersForMatchDay = async (user, leagueId, matchDay) => {
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


const getLineup = async (leagueId) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/lineup `, config)
  // return response.data
  return response.data.players.filter(p => p !== null)
}



export default {
  setToken,
  // getOverview,
  getUsers,
  getCurrentMatchDay,
  getLive,
  getPlayersForMatchDay,
  getLineup
}