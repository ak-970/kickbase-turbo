import { useState, useEffect, useRef } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// utils
import formatDate from '../utils/formatDate'

// Chart.js
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'



const ChartCanvas = ({ data }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const chart = new Chart(ctx, { data })
  }, [])

  return <canvas ref={canvasRef}/>
}



const Player = ({ player }) => {

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
    <div className='player-item' key={player.id}>
      {/* <p><b>{player.firstName} {player.lastName}</b> | P {player.totalPoints}, Ø {player.averagePoints} | € {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</p> */}
      <div><b>{player.firstName} {player.lastName}</b></div>
      <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
      <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
      <div className='chart-container'>
        <ChartCanvas data={chartData}/>
      </div>
    </div>
  )
}



const Squad = ({ user, league, users, clubs }) => {

  // use states
  const [keepers, setKeepers] = useState([])
  const [defense, setDefense] = useState([])
  const [midfield, setMidfield] = useState([])
  const [attack, setAttack] = useState([])

  useEffect(() => {
    kickbaseService
      .getUserPlayersExtended(league, user.id)
      .then(lineup => {
        console.log('userPlayersExtended', lineup)
        setKeepers(lineup.filter(l => l.position === 1))
        setDefense(lineup.filter(l => l.position === 2))
        setMidfield(lineup.filter(l => l.position === 3))
        setAttack(lineup.filter(l => l.position === 4))
      })
  }, [league])


  return (
    <section className='squad'>
      <h2>Kader</h2>
      <div className='squad-list'>
        <div className='player-position keeper'>
          <h3>Tor</h3>
          {keepers.map(player =>
            <Player key={player.id} player={player} />
          )}
        </div>
        <div className='player-position defense'>
          <h3>Abwehr</h3>
          {defense.map(player =>
            <Player key={player.id} player={player} />
          )}
        </div>
        <div className='player-position midfield'>
          <h3>Mittelfeld</h3>
          {midfield.map(player =>
            <Player key={player.id} player={player} />
          )}
        </div>
        <div className='player-position attack'>
          <h3>Angriff</h3>
          {attack.map(player =>
            <Player key={player.id} player={player} />
          )}
        </div>
      </div>
    </section>
  )
}

export default Squad