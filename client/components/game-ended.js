/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var RoundEndedComponent = React.createClass({
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

  startRound: function(e) {
    e.preventDefault();
    game.startRound(React.findDOMNode(this.refs.word).value.trim());
  },

  render: function() {
    var startRoundControls = null;
    if (App.player().isJudge() === true) {
      startRoundControls = (
        <p>Start igen</p>
      );
    }

    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 m-t-lg">
              <h2>Spillet er slut!</h2>
              {startRoundControls}
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = RoundEndedComponent;

