import axios from 'axios'
// import formatDate from '../utils/formatDate'

// const getCurrentMatchDay = async () => {
//   const response = await axios.get('https://api.openligadb.de/getcurrentgroup/bl1f')
//   return response.data.groupOrderID
// }

const getMatchDays = async () => {
  const matchDays = [...Array(23).keys()].slice(1)
  const response = await axios.get('https://api.openligadb.de/getmatchdata/bl1f/2023')
  // return response.data.reduce((a, b) => (a.includes(b.matchDateTime) ? a : a.concat(b.matchDateTime)), [])
  return matchDays.map(md => ({
    day : md,
    // matches : response.data.reduce((a, b) => ((a.includes(b.matchDateTime) || md !== b.group.groupOrderID) ? a : a.concat(b.matchDateTime)), [])
    matches : response.data.filter(m => m.group.groupOrderID === md).map(m => ({
      matchDateTime : m.matchDateTime,
      isFinished : m.matchIsFinished,
      team1 : m.team1.teamId,
      team2 : m.team2.teamId
    }))
  }))
}

const getMatchDayData = async (matchDay) => {
  const response = await axios.get(`https://api.openligadb.de/getmatchdata/bl1f/2023/${matchDay}`)
  return response.data.map(m => ({
    id : m.matchID,
    dateTime : m.matchDateTime,
    started : new Date(m.matchDateTime) < new Date(),
    finished : m.matchIsFinished,
    now : new Date(m.matchDateTime) < new Date() && !m.matchIsFinished,
    team1 : {
      id : m.team1.teamId,
      name : m.team1.teamName,
      result : m.matchResults[1] ? m.matchResults[1].pointsTeam1 : 0
    },
    team2 : {
      id : m.team2.teamId,
      name : m.team2.teamName,
      result : m.matchResults[1] ? m.matchResults[1].pointsTeam2 : 0
    }
  }))
}

// const getCurrentMatchDayData = async () => {
//   const matchDay = await getCurrentMatchDay()
//   return await getMatchDayData(matchDay)
// }

export default {
  // getCurrentMatchDay,
  getMatchDays,
  getMatchDayData,
  // getCurrentMatchDayData
}