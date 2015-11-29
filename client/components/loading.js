/** @jsx React.DOM */
var React = require('react');

var LoadingComponent = React.createClass({

  render: function() {
    return (
      <div className="panel">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 text-center">
              <h3>Venter på bibliotikaren</h3>
              <p>Bogtitler hentes</p>
            </div>
            <div className="bookshelf_wrapper">
              <ul className="books_list">
                <li className="book_item first"></li>
                <li className="book_item second"></li>
                <li className="book_item third"></li>
                <li className="book_item fourth"></li>
                <li className="book_item fifth"></li>
                <li className="book_item sixth"></li>
              </ul>
              <div className="shelf"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = LoadingComponent;
