// components
import Icon from './Icon'

const PlayerS = ({ player, clubIcon }) =>
  <div className={`player-item ${player.linedUp ? 'lined-up' : 'not-lined-up'}`}>
    <div className='player'>
      <img className="team-icon" src={clubIcon} />
      <span>
        {player.firstName} {player.lastName}
        {player.injured && <Icon type='injured'/>}
      </span>      
    </div>
    <div className="points">{player.points}</div>
  </div>

export default PlayerS