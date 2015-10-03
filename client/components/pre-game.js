/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game');


var PreGameComponent = React.createClass({
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
    var content = null,
        title = null;
    if (App.player().isJudge() === true) {
      title = 'Hej Sjæf!';
      content = (
        <form onSubmit={this.startRound}>
          <input autoFocus="true" ref="word" />
          <button></button>
        </form>
      );
    } else {
      title = 'Hej Spiller!';
      content = (
        <div>some text</div>
      );
    }


    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 m-t-lg">
              <h2>{title}</h2>
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = PreGameComponent;

