/** @jsx React.DOM */
var React = require('react'),
    App = require('../app');

var ScoreComponent = React.createClass({
  componentWillMount: function() {
    this.props.game.words.on('change add remove', () => {
      this.forceUpdate();
    });
  },

  componentWillUnmount: function() {
    this.props.game.words.off('change add remove');
  },

  render: function() {
    return (
      <table className="score-table">
        <tbody> 
          <tr>
            <td></td>
            {this.props.game.players.map((player, i) => {
              var dotClasses = 'player-dot pcolor-' + player.get('color');
              if (App.player().get('id') === player.get('id')) {
                dotClasses += ' bounce';
              }
              return (
                <td key={i}>
                  <div className={dotClasses}></div>
                </td>
              );
            })}
          </tr>
          <tr>
            <td>Resultat</td>
            {this.props.game.players.map((player, i) => {
              var dotClasses = 'player-dot pcolor-' + player.get('color');
              return (
                <td key={i}>
                  {player.getScore()}
                </td>
              );
            })}
          </tr>
        </tbody>
        {this.props.game.getScoreTable().map((word, wi) => {
          return (
            <tr key={wi}>
              <td>{word.word}</td>
              {this.props.game.players.map((player, i) => {
                var score = word.scores[player.get('id')] || null;
                if (score === 0) { score = ''; }
                return ( <td key={i}>{score}</td> );
              })}
            </tr>
          );
        })}
      </table>

    );

  }
});

module.exports = ScoreComponent;
