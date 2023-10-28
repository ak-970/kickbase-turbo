import { useState, useEffect, useRef } from 'react'

// services
import kickbaseService from '../services/kickbase'
import openligadbService from '../services/openligadb'

// utils
import formatDate from '../utils/formatDate'

// Chart.js
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'


// const ChartCanvas = ({ ctx }) => {
//   const chart = new Chart(ctx, {
//     type: 'line',
//     data: data,
//     options: {
//       onClick: (e) => {
//         const canvasPosition = getRelativePosition(e, chart)

//         // Substitute the appropriate scale IDs
//         const dataX = chart.scales.x.getValueForPixel(canvasPosition.x)
//         const dataY = chart.scales.y.getValueForPixel(canvasPosition.y)
//       }
//     }
//   })
// }

// const Canvas = props => {
//   const canvasRef = useRef(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     const context = canvas.getContext('2d')
//     //Our first draw
//     context.fillStyle = '#000000'
//     context.fillRect(0, 0, context.canvas.width, context.canvas.height)
//   }, [])

//   return <canvas ref={canvasRef} {...props}/>
// }

const ChartCanvas = ({ data }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        // onClick: (e) => {
        //   const canvasPosition = getRelativePosition(e, chart)

        //   // Substitute the appropriate scale IDs
        //   const dataX = chart.scales.x.getValueForPixel(canvasPosition.x)
        //   const dataY = chart.scales.y.getValueForPixel(canvasPosition.y)
        // }
      }
    })

  }, [])

  return <canvas ref={canvasRef}/>
}


const Player = ({ player, matchDays }) => {

  // use states
  const [statDays, setStatDays] = useState(100)

  const pointHistoryExtended = (mh, ph) => mh.map(h =>
    ph.find(ph => formatDate(ph.matchDateTime) === formatDate(h.day))
      ? ph.find(ph => formatDate(ph.matchDateTime) === formatDate(h.day)).points
      : 0
  )

  const pointHistoryExtendedAverage = (mh, ph) => {
    console.log('pointHistoryExtendedAverage...')
    const phe = ph.filter(h => h.season.id === 24).reduce((a, b) => (a.concat({
      ...b,
      pointsTotal : (b.points + a.reduce((a2, b2) => (a2 + b2.points), 0)),
      pointsAverage : (b.points + a.reduce((a2, b2) => (a2 + b2.points), 0)) / b.day
    })), [])
    // console.log(phe)
    return mh.map(h =>
      phe.find(phe => formatDate(phe.matchDateTime) === formatDate(h.day))
        ? phe.find(phe => formatDate(phe.matchDateTime) === formatDate(h.day)).pointsAverage
        : null
    )
  }

  // console.log('player', player)
  // console.log('marketValueHistory', player.marketValueHistory.slice(-statDays).map(h => h.m))
  const chartData = {
    labels: player.marketValueHistory.slice(-statDays).map(h => formatDate(h.day, 'D.M.YY')),
    datasets: [
      {
        type: 'line',
        label: 'Marktwert',
        data: player.marketValueHistory.slice(-statDays).map(h => h.marketValue / 100000)
      },
      {
        type: 'line',
        label: 'Durchschnittspunkte',
        data: pointHistoryExtendedAverage(player.marketValueHistory.slice(-statDays), player.pointHistory)
      },
      // {
      //   type: 'bar',
      //   label: 'Spieltage',
      //   // data: player.pointHistory.map(h => h.points)
      //   data: player.marketValueHistory.slice(-statDays).map(h => -1),
      //   options : { barThickness : 1 }
      // },
      {
        type: 'bar',
        label: 'Punkte',
        // data: player.pointHistory.map(h => h.points)
        // data: player.marketValueHistory.slice(-statDays).map(h => Math.random() * 150)
        data: pointHistoryExtended(player.marketValueHistory.slice(-statDays), player.pointHistory)
      },
    //   {
    //     type: 'line',
    //     label: 'Test',
    //     data : [null, null, 0, 120, null, 250, 46],
    //     labels : [null, null, '3.8.23', '23.8.23', null, '10.9.23', '24.10.23']
    //   }
    ]
  }
  // console.log('find points...', player.lastName,
  //   player.marketValueHistory.slice(-statDays).map(h => ({
  //     phistory : player.pointHistory.map(ph => formatDate(ph.matchDateTime)),
  //     current : formatDate(h.day),
  //     found : player.pointHistory.find(ph => formatDate(ph.matchDateTime) === formatDate(h.day)),
  //     // points : this.found ? this.found.points : 0
  //   }))
  // )
  return (
    <div className='player-item' key={player.id}>
      <div>{player.firstName} {player.lastName}</div>
      <div>P {player.totalPoints}, Ø {player.averagePoints}</div>
      <div>€ {player.marketValue} {player.marketValueTrend === 1 ? '↑' : '↓'}</div>
      <ChartCanvas data={chartData}/>
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
      // .getLineupExtended(league)
      // .getUserPlayers(league, user.id)
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