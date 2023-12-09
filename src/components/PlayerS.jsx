// components
import Icon from './Icon'

const PlayerS = ({ player, clubIcon, placeholder }) => {
  return placeholder ? <div className='player-item placeholder'></div> :
    <div className={`player-item ${player.linedUp ? 'lined-up' : 'not-lined-up'}`}>
      <div className='player'>
        <img className="team-icon" src={clubIcon} />
        <span className='player-number'>{player.number}</span>
        <span>
          {player.firstName} {player.lastName}
          {player.injured && <Icon type='injured'/>}
        </span>      
      </div>
      <div className="points">{player.points}</div>
    </div>
}

export default PlayerS