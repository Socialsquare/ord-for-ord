
Template.welcome.helpers({
});

Template.welcome.events({
  'click button': function() {
    Session.set('state', 'lobby');
  }
});

Template.welcomerendered = function() {

};
