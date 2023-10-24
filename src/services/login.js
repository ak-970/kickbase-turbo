import axios from 'axios'
// axios.defaults.withCredentials = true

const baseUrl = 'https://api.kickbase.com/user/login'

const login = async credentials => {
  const response = await axios.post(
    baseUrl,
    { ...credentials, 'ext': false },
    { withCredentials: true }
  )
  return {
    token : response.data.token,
    id : response.data.user.id,
    name : response.data.user.name,
    bgImage : response.data.user.cover,
    image : response.data.user.profile,
    leagues : response.data.leagues.map(l => ({ id : l.id, name : l.name }))
  }
}

export default { login }