Meteor.startup(function(){
  Meteor.subscribe('users');
});


// Define some handlers
var okcancel_events = function (selector) {
  return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
};

// Creates an event handler for interpreting "escape", "return", and "blur"
// on a text field and calling "ok" or "cancel" callbacks.
var make_okcancel_handler = function (options) {
  var ok = options.ok || function () {};
  var cancel = options.cancel || function () {};

  return function (evt) {
    if (evt.type === "keydown" && evt.which === 27) {
      // escape = cancel
      cancel.call(this, evt);
    }
    else if (evt.type === "keyup" && evt.which === 13) {
      // blur/return/enter = ok/submit if non-empty
      var value = String(evt.target.value || "");
      if (value)
        ok.call(this, value, evt);
      else
        cancel.call(this, evt);
    }
  };
};


Template.getName.events = {};

Template.getName.events[ okcancel_events('#userNameInput') ] = make_okcancel_handler({
  'ok': function(text, event){
    Session.set("userName", $("#userNameInput").val());
    Session.set("userId", Meteor.uuid());
    $("#userNameInput").val("Thanks!");

    Meteor.call("addUser", Session.get("userName"), Session.get("userId")); 
  }
});

Template.userList.users = function(){
  return Users.find().fetch();
};
