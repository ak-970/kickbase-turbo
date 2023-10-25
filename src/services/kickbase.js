import axios from 'axios'

const baseUrl = 'https://api.kickbase.com'

const leagueId = 4077604

let token = null
// const tokenCookie = () => `kkstrauth=${token};`
const setToken = newToken => {
  token = `bearer ${newToken}`
}

const getOverview = async () => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/live/`, config)
  return response.data
}


const getUsers = async () => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/`, config)
  let users = []
  response.data.users.forEach(u => {
    users.push({
      id : u.id,
      name : u.name,
      image : u.profile,
      points : u.pt
    })
  })
  return users
}

const getLive = async () => {
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

const getPlayersForMatchDay = async (user, matchDay) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = await axios.get(`${baseUrl}/leagues/${leagueId}/users/${user}/players?matchDay=${matchDay}`, config)
  return {
    user,
    points : response.data.players.reduce((a, b) => a + ((response.data.currentDay >= response.data.day && b.totalPoints) ? b.totalPoints : 0), 0),
    // points : 0,
    currentDay : response.data.currentDay,
    day : response.data.day,
    players : response.data.players.filter(p => p.id !== '0').map(pl => ({
      id : pl.id,
      club : pl.teamId,
      firstName : pl.firstName,
      lastName : pl.lastName,
      number : pl.number,
      points : (pl.dayPoints || 0),
      position : pl.position,
      image : pl.profileBig
    }))
  }
}



export default {
  setToken,
  getOverview,
  getUsers,
  getLive,
  getPlayersForMatchDay
}