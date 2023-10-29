import { useState } from 'react'

// utils
import formatDate from '../utils/formatDate'

// components
import ChartCanvas from './ChartCanvas'


const PlayerL = ({ player }) => {

  // use states
  const [statDays, setStatDays] = useState(70)

  const pointHistoryExtended = () => {
    let history = player.pointHistory.filter(h => h.matchDateTime !== '2022').reduce((a, b) => (a.concat({
      ...b,
      pointsTotal : a.reduce((a2, b2) => (a2 + b2.points), 0) + b.points,
      pointsAverage : (a.reduce((a2, b2) => (a2 + b2.points), 0) + b.points) / b.day
    })), [])
    history.unshift({
      day : 0,
      matchDateTime : player.marketValueHistory.slice(-statDays)[0].day,
      points : 0,
      pointsTotal : 0,
      pointsAverage : 0
    })
    history.push({
      day : 0,
      matchDateTime : player.marketValueHistory.slice(-1)[0].day,
      points : 0,
      pointsTotal : history.slice(-1)[0].pointsTotal,
      pointsAverage : history.slice(-1)[0].pointsAverage
    })
    return history
  }



  const chartData = {
    datasets: [
      {
        type: 'line',
        label: 'Marktwert/100k',
        tension: 0.2,
        pointRadius : 0,
        // yAxisID : 'marketValue',
        data: player.marketValueHistory.slice(-statDays).map(h => ({
          x : formatDate(h.day, 'D.M.YY'),
          y : h.marketValue / 100000
        }))
      },
      {
        type: 'bar',
        label: 'Punkte',
        // yAxisID : 'points',
        data: pointHistoryExtended().map(h => ({
          x : formatDate(h.matchDateTime, 'D.M.YY'),
          y : h.points
        }))
      },
      {
        type: 'line',
        label: 'Punkte Ø',
        tension: 0.3,
        pointRadius : 0,
        // fill: 'origin',
        // yAxisID : 'points',
        data: pointHistoryExtended().map(h => ({
          x : formatDate(h.matchDateTime, 'D.M.YY'),
          y : h.pointsAverage
        }))
      },
      {
        type: 'line',
        label: 'zero',
        // hiddenLegend: true,
        // borderColor: '#000',
        pointRadius : 0,
        data: [
          {
            x : formatDate(player.marketValueHistory.slice(-statDays)[0].day, 'D.M.YY'),
            y : 0
          },
          {
            x : formatDate(player.marketValueHistory.slice(-1)[0].day, 'D.M.YY'),
            y : 0
          }
        ]
      }
    ]
  }

  return (
    <div className='player-item player-l' key={player.id}>
      <div className='person'>
        <div className='image'>
          <img src={player.image} />
        </div>
        <div className='info'>
          <div><b>{player.firstName} {player.lastName}</b> ID {player.id}</div>
          <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
          <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
        </div>
      </div>
      <div className='chart-container'>
        <ChartCanvas data={chartData}/>
      </div>
    </div>
  )
}


export default PlayerL