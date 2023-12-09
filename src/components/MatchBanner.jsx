
// utils
import formatDate from '../utils/formatDate'

// data
import { getClubIcon } from '../data/clubs'

const MatchBanner = ({ match }) => {
  const matchStatus = match.started && !match.now ? 'finished' : (match.now ? 'now' : 'pending')
  const date = new Date(match.dateTime)
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  return (
    <div className={`match-banner ${matchStatus}`}>
      <div className="team-1">
        <img className="team-icon" src={getClubIcon(match.team1.id)} />
        
      </div>
      <div className="info">
        <div className="time">{`${days[date.getDay()]} ${formatDate(date, 'D.M.YY hh:mm')}`}</div>
        <div className="result">
          {`${match.team1.result} : ${match.team2.result}`}
          {match.now && <div className='live'>{`${match.minute}'`}</div>}
        </div>
      </div>
      <div className="team-2">
        <img className="team-icon" src={getClubIcon(match.team2.id)} />
      </div>
    </div>
  )
}

export default MatchBanner