/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var GameEndedComponent = React.createClass({
  getInitialState: function() {
    return { };
  },

  componentWillMount: function() {
    game.players.on('change add remove', () => {
      this.forceUpdate();
    });
  },

  componentWillUnmount: function() {
    game.players.off('change add remove');
  },

  restart: function(e) {
    game.restart();
  },

  render: function() {
    var startRoundControls = null;
    if (App.player().isJudge() === true) {
      startRoundControls = (
        <button onClick={this.restart} className="btn btn-startgame btn-default">
        Start igen</button>
      );
    }

    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 m-t-lg">
              <h2>Spillet er slut!</h2>
              
              <table>
                <tr> 
                  <td></td>
                  {game.players.map((player, i) => {
                    if (player.isJudge() === true) { return null; }
                    var dotClasses = 'player-dot pcolor-' + player.get('color');
                    return (
                      <td key={i}>
                        <div className={dotClasses}></div>
                      </td>
                    );
                  })}
                </tr>
                {game.getScoreTable().map((word, wi) => {
                  return (
                    <tr key={wi}>
                      <td>{word.word}</td>
                      {game.players.map((player, i) => {
                        if (player.isJudge() === true) { return null; }
                        var score = word.scores[player.get('id')] || null;
                        if (score === 0) { score = ''; }
                        return ( <td key={i}>{score}</td> );
                      })}
                    </tr>
                  );
                })}
                <tr> 
                  <td>Sum</td>
                  {game.players.map((player, i) => {
                    if (player.isJudge() === true) { return null; }
                    var dotClasses = 'player-dot pcolor-' + player.get('color');
                    return (
                      <td key={i}>
                        {player.getScore()}
                      </td>
                    );
                  })}
                </tr>
              </table>

              {startRoundControls}
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = GameEndedComponent;
