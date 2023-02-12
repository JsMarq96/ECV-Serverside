var GAME_SERVER_MANAGER = {

  init: function() {
    this.rooms = {};
    this.active_users = {};

    return this;
  },

  room_template: {
    users:[],
    back_img: ''
  },

  user_template: {
    position: {x: 0, y: 0}
  },

  add_room: function(name, back_img) {
    var room_obj = {... this.room_template};

    room_obj.back_img = back_img;

    this.rooms[name] = room_obj;
  },


  get_users_on_chatroom: function(room_id, on_finish) {
    return this.rooms[room_id].users;
  },

  get_users_on_chatroom_near_me: function(room_id, user_id, distance, on_finish) {
    var room_users = this.rooms[room_id].users;
    var user_pos = null;
    var near_user_id_list = [];
    // Find the current user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i] == user_id) {
        user_pos = this.active_users[room_users[i]].position.x;
      }
    }

    // Find the users near the user
    for(var i = 0; i < room_users.length; i++) {
      // Skip the current user
      if (room_users[i].id == user_id) {
        continue;
      }

      // If its near, or less the max distance, add to the list
      if (Math.abs(room_users[i].position.x - user_pos) < distance) {
        near_user_id_list.push(room_users[i].id);
      }
    }

    return near_user_id_list;
  },

  add_user: function(user_id) {
    this.users[user_id] = {... self.user_template};
  },

  remove_user: function(user_id) {
    delete this.users[user_id];
  },

  join_chatroom: function(user_id, room_id) {
    this.rooms[room_id].users.push(user_id);
  }
};

module.exports = {game_server: GAME_SERVER_MANAGER};
