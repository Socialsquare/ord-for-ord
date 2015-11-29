/** @jsx React.DOM */
var React = require('react');

var LoadingComponent = React.createClass({

  render: function() {
    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <h1>Venter på bibliotikaren</h1>
              <h2 className="text-center">
                <span className="loading-dots">
                  <span className="dot dot-1">&bull;</span>
                  <span className="dot dot-2">&bull;</span>
                  <span className="dot dot-3">&bull;</span>
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = LoadingComponent;
