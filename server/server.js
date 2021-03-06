
Meteor.startup(function(){
  Alerts.remove({});
  Songs.update({currentlyPlaying: true}, {$set: {currentlyPlaying: false}});
  Users.remove({});
  Rooms.remove({});
  Messages.remove({});

});

Meteor.publish("users", function(roomName){
  return Users.find({roomName: roomName});
});

Meteor.publish("alerts", function(){
 return Alerts.find();
});

var alert = function(data){
  Alerts.remove({});
  Alerts.insert(data);
};

Meteor.setInterval(function(){

  var filter = {};

  // ProTip: unless you need it, don't send lastSeen down as it'll make your 
  // templates constantly re-render (and use bandwidth)
//   var connected =  Meteor.presences.find(filter, {fields: {state: true, userId: true}}).fetch();
  var connected =  Meteor.presences.find(filter, {userId: 1}).fetch();
  var users = Users.find({}, {userId:1}).fetch();

  var c = [];
  for(var a=0; a<connected.length; a++)
    c[a] = connected.userId;

  var u = [];
  for(var b=0; b<users.length; b++)
    u[b] = users.userId;

  var d = _.difference(u, c);

  console.log(c.length, u.length, d.length);
 
  console.log("difference");
  for(var z=0; z<d.length; z++)
    Users.remove({userId: d[z].userId});

}, 1000*100);



Meteor.publish('playlists', function(){
  return Playlists.find();
});

Meteor.publish('messages', function(roomName){
  return Messages.find({roomName: roomName});
});

Meteor.publish('songs', function(){
  return Songs.find();
});

Meteor.publish('rooms', function() {
  return Rooms.find();
});

Meteor.methods({
  addUser: function(userName, userId, roomName){
    console.log("adding user");
    Users.insert({
      userName: userName,
      userId: userId,
      roomName: roomName,
      reputation: 0,
      timeJoined:Date.now()
    });
  },

  appointUser: function(userId, roomName){
    //Set all the current selector users to false
    Users.update({roomName: roomName}, {$set: {canSearch:false}});
    //Set the userid to be the selector
    Users.update({_id: userId, roomName: roomName}, {$set: {canSearch:true}});

    //Set the next playing song to this users next playing song (if available)
   // var songFromPlaylist = Playlists.
    
    //Set the next user to this users next user (if available)
  },
    
  removeUser: function(userId){
    console.log('removeUser');
    console.log("removing user" + userId);
    Users.remove({userId: userId});
  },
  addSongToPlaylist: function(songId, userId){
    console.log("adding song to playlist");
    Playlists.insert({songId: songId, userId:userId, time:Date.now()});
    Users.update({userId:userId}, {$inc: {playCount: 1}});
  },
  addToChat: function(userName, userId, roomName, text){
    Messages.insert({
      userId: userId,
      userName: userName,
      text: text,
      roomName: roomName,
      time:Date.now()
    });
  },
  updateSong: function(songId, roomName){
//    Room.update({name: roomName}, {currSong: songId});
  },
  selectSong: function(songId, userId){
    console.log("selecting song");
    user = Users.findOne(userId, {$inc: {reputation: 1}});

    console.log("inside select song");
    Songs.update({currentlyPlaying:true}, {$set: {currentlyPlaying:false, startTime:0}}); 
    Songs.update({_id: songId}, {$set: {currentlyPlaying:true, startTime:Date.now()}});
  },
  setSongStartTime: function(songId){
    Songs.update({_id: songId}, {$set: {startTime:Date.now()}});
  },
  startNextSong: function(roomName){
    var nextUser = Rooms.findOne({name: roomName}, {nextPlayer: 1});
    Rooms.update({name: roomName}, {currPlayer: nextUser}); 
    console.log("roomName", roomName, "next user", nextUser);
  },
  updateRoom: function(selector, modifier) {
    console.log("updateroom");
    Rooms.update(selector, modifier);
  },
  findOneRoomWithUrl: function(selector) {
    return Rooms.findOne(selector);
  },
  createRoom: function(url, currPlayer){
    if(!Rooms.findOne({url: url})){
      Rooms.insert({
         name: url,
         url: url,
         currPlayer: currPlayer,
         currSong: null
       });
    }
  }
});
