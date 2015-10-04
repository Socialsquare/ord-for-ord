
module.exports = {
  preventCharacters: function(e) {
    var which = event.which || event.keyCode;
    var ch = String.fromCharCode(which);
    if (ch.match(/[a-zåæø-]/i) === null){
      e.preventDefault();
    }
  }
};

