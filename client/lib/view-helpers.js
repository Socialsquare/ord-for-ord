
module.exports = {
  preventCharacters: function(e) {
    var which = event.which || event.keyCode;
    var ch = String.fromCharCode(which);
    if (which !== 13 && ch.match(/[a-zåæø-]/i) === null){
      e.preventDefault();
    }
  }
};

