/** @jsx React.DOM */
var React = require('react'),
    game = require('../models/game'),
    vh = require('../lib/view-helpers');


var PreGameComponent = React.createClass({
  getInitialState: function() {
    return {
      shaking: false,
      totalCount: '...',
    };
  },

  shake: function() {
    clearTimeout(this.shakeTimeout);
    this.setState({
      shaking: true
    });
    this.shakeTimeout = setTimeout(() => {
      this.setState({
        shaking: false
      });
    }, 500);
  },

  componentWillMount: function() {
    game.players.on('change add remove', () => {
      this.forceUpdate();
    });
  },

  componentDidMount: function() {
    var selectedCategories = this.selectedCategories(React.findDOMNode(this.refs.categories));
    this.setCategories(selectedCategories);
  },

  componentWillUnmount: function() {
    game.players.off('change add remove');
  },

  start: function(e) {
    e.preventDefault();
    var word = React.findDOMNode(this.refs.word).value.trim();
    if(word) {
      game.appendWord(word);
    } else {
      this.shake();
    }
  },

  categories: function() {
    return [
      { key: 'philosophy', name:'Filosofi' },
      { key: 'psychology', name:'Psykologi' },
      { key: 'science', name:'Videnskab' },
      { key: 'politics', name:'Politik' },
      { key: 'economics', name:'Økonomi' },
      { key: 'geography', name:'Geografi og rejser' },
      { key: 'natural_science', name:'Naturvidenskab' },
      { key: 'biology', name:'Biologi' },
      { key: 'tech', name:'Teknik' },
      { key: 'art', name:'Kunst' },
      { key: 'music', name:'Musik' },
      { key: 'history', name:'Historie' }
    ];
  },

  selectedCategories: function(select) {
    var options = select.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    return value;
  },

  categoriesChanged: function(e) {
    var selectedCategories = this.selectedCategories(e.target);
    this.setCategories(selectedCategories);
  },

  setCategories: function(categories) {
    game.setCategories(categories).then((count) => {
      this.setState({
        totalCount: count
      });
    });
  },

  render: function() {
    var content = null,
        title = null;
    title = 'Hej Spiller!';
    content = (
      <div>Spillet starter, når dommeren har defineret det første ord
      og valgt en kategori.<br/><br/>
      Når det er din tur, skriver du et ord, der i sammenhæng med de forrige
      forsat er meningsgivende og som du mener vil indgå i flest bogtitler.<br/><br/>
      Når det er dine modspilleres tur, kan du udfordre dem ved at gætte på,
      hvad de vil skrive. Hvis du gætter rigtigt, får du halvdelen af deres
      points.<br/><br/>
      Spillet slutter efter (tid/runder) eller når overdommeren lader sætter
      et punktum.</div>
    );



    return (
      <div className="panel pregame">
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
