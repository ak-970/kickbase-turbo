import { useState } from 'react'

// utils
import formatDate from '../utils/formatDate'
import formatNumber from '../utils/formatNumber'
import formatTime from '../utils/formatTime'

// components
import ChartCanvas from './ChartCanvas'
import Icon from './Icon'


const PlayerL = ({ player }) => {

  // use states
  const [statDays, setStatDays] = useState(80)

  const chart = {
    data : {
      datasets: [
        {
          type: 'line',
          label: 'Marktwert/100k',
          tension: 0.2,
          pointRadius : 0,
          borderColor : '#4969be',
          data: player.marketValueHistory.slice(-statDays).map(h => ({
            x : formatDate(h.day, 'D.M.YY'),
            y : h.marketValue / 100000
          }))
        },
        {
          type: 'bar',
          label: 'Punkte',
          backgroundColor : '#8e43b9',
          data: player.pointHistory
            .filter(h => (
              player.marketValueHistory.slice(-statDays).map(h2 => formatDate(h2.day, 'D.M.YY')).includes(formatDate(h.matchDateTime, 'D.M.YY'))
            ))
            .map(h => ({
              x : formatDate(h.matchDateTime, 'D.M.YY'),
              y : h.points
            }))
        },
        {
          type: 'bar',
          label: 'verpasste Spiele',
          backgroundColor : '#afafaf',
          data: player.pointHistory
            .filter(h => (
              player.marketValueHistory.slice(-statDays).map(h2 => formatDate(h2.day, 'D.M.YY')).includes(formatDate(h.matchDateTime, 'D.M.YY'))
            ))
            .filter(d => d.points === null)
            .map(h => ({
              x : formatDate(h.matchDateTime, 'D.M.YY'),
              y : 5
            }))
        },
        // {
        //   type: 'line',
        //   label: 'Ø Punkte gespielt',
        //   tension: 0.2,
        //   pointRadius : 0,
        //   data: player.pointHistory
        //     .filter(h => (
        //       player.marketValueHistory.slice(-statDays).map(h2 => formatDate(h2.day, 'D.M.YY')).includes(formatDate(h.matchDateTime, 'D.M.YY'))
        //     ))
        //     .map(h => ({
        //       x : formatDate(h.matchDateTime, 'D.M.YY'),
        //       y : h.pointsAveragePlayedMatches
        //     }))
        // },
        {
          type: 'line',
          // label: 'Ø Punkte alle',
          label: 'Ø Punkte',
          tension: 0.2,
          pointRadius : 0,
          borderColor : '#d48e31',
          data: player.pointHistory
            .filter(h => (
              player.marketValueHistory.slice(-statDays).map(h2 => formatDate(h2.day, 'D.M.YY')).includes(formatDate(h.matchDateTime, 'D.M.YY'))
            ))
            .map(h => ({
              x : formatDate(h.matchDateTime, 'D.M.YY'),
              y : h.pointsAverageAllMatches
            })).concat({
              x : formatDate(player.marketValueHistory.slice(-1)[0].day),
              y : player.pointHistory.slice(-1)[0].pointsAverageAllMatches
            })
        }
      ]
    },
    options : {
      scales: {
        // x: {
        //   grid: {
        //     tickColor: 'red',
        //     // tickColor: context => context.tick.value == 0 ? '#fff' : '#000',
        //     // tickLength: context => context.tick.value == 0 ? 5 : 1,
        //     // tickWidth: context => context.tick.value == 0 ? 3 : 1
        //   }
        // },
        y: {
          grid: {
            // lineWidth: context => context.tick.value == 0 ? 2 : 1,
            color : context => context.tick.value == 0 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)',
            // display : true
          }
        }
      },
    }
  }

  return (
    <div className='player-item player-l' key={player.id}>
      <div className='person'>
        {player.image && <div className='image'>
          <img src={player.image} />
        </div>}
        <div className='info'>
          <div>
            <b className='name'>{player.firstName} {player.lastName}</b>
            {player.injured && <Icon type='injured'/>}
            {player.linedUp && <Icon type='person-circle-check-green'/>}
          </div>
          {/* <div>P {formatNumber(player.totalPoints)}, Ø {formatNumber(player.averagePoints)}</div> */}
          <div>
            P {formatNumber(player.totalPoints)},&nbsp;
            Ø {formatNumber(player.pointHistory.slice(-1)[0].pointsAverageAllMatches)} ({formatNumber(player.averagePoints)})&nbsp;
          </div>
          <div>
            € {formatNumber(player.marketValue)}
            <Icon type={`arrow-trend-${player.marketValueTrend === 1 ? 'up' : 'down'}`} /> 
          </div>
        </div>
        <div className='offers'>
          {player.expiry &&
            <div key={player.id} className='expiry'>
              Läuft ab in {formatTime(player.expiry * 1000)}
            </div>
          }
          {player.offers && player.offers.map(o =>
            <div key={o.id} className='offer'>
              Angebot: €&nbsp;
              <b className={o.price > player.marketValue ? 'good' : 'bad'}>
                {formatNumber(o.price)}
              </b>&nbsp;
              {formatTime(new Date(o.dateExpiry) - new Date()) != ''
                ? `(${formatTime(new Date(o.dateExpiry) - new Date())})`
                : ''
              }
            </div>
          )}
        </div>
      </div>
      <div className='chart-container'>
        <ChartCanvas data={chart.data} options={chart.options}/>
      </div>
    </div>
  )
}


export default PlayerL