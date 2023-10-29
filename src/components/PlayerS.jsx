const PlayerS = ({ player, clubIcon }) =>
  <div className={`player-item ${player.linedUp ? 'lined-up' : 'not-lined-up'}`}>
    <div className='player'>
      <img className="team-icon" src={clubIcon} />
      {player.firstName} {player.lastName}
    </div>
    <div className="points">{player.points}</div>
  </div>

export default PlayerS