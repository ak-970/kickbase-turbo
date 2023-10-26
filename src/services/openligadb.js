import axios from 'axios'

// const getCurrentMatchDay = async () => {
//   const response = await axios.get('https://api.openligadb.de/getcurrentgroup/bl1f')
//   return response.data.groupOrderID
// }

const getMatchDayData = async (matchDay) => {
  const response = await axios.get(`https://api.openligadb.de/getmatchdata/bl1f/2023/${matchDay}`)
  return response.data.map(m => ({
    id : m.matchID,
    dateTime : m.matchDateTime,
    finished : m.matchIsFinished,
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
  getMatchDayData,
  // getCurrentMatchDayData
}