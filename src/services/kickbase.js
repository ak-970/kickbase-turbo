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
      club : parseInt(pl.tid),
      firstName : pl.fn,
      lastName : pl.n,
      number : pl.nr,
      points : pl.t,
      position : pl.p
    }))
  }))
}



export default {
  setToken,
  getOverview,
  getUsers,
  getLive
}