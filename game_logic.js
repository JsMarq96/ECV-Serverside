var GAME_SERVER_MANAGER = {

  init: function() {
    this.rooms = {};
    this.user_room_id = {};
    return this;
  },

  room_template: {
    users:[],
    back_img: '',
    start_position: 0.0
  },

  user_template: {
    id: 0,
    position: {x: 0, y: 0},
    item_on_hand: {}
  },

  add_room: function(name, back_img) {
    var room_obj = {... this.room_template};

    room_obj.back_img = back_img;

    this.rooms[name] = room_obj;
  },


  get_users_on_chatroom: function(room_id, on_finish) {
    return this.rooms[room_id].users;
  },
  get_users_id_on_chatroom: function(room_id) {
    var room_users = this.rooms[room_id].users;
    var user_id_list = [];

    for(var i = 0; i < room_users.length; i++) {
      user_id_list.push(room_users[i].id);
    }

    return user_id_list;
  },

  get_users_ids_on_chatroom_near_me: function(room_id, user_id, distance) {
    var room_users = this.rooms[room_id].users;
    var user_pos = null;
    var near_user_id_list = [];
    // Find the current user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        user_pos = room_users[i].position.x;
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

  remove_user: function(user_id, room_id) {
    var room_users = this.rooms[room_id].users;

    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        delete room_users[i];
      }
    }
  },

  join_chatroom: function(user_id, room_id) {
    var new_user = { ... this.user_template}
    new_user.id = user_id;
    new_user.position.x = this.rooms[room_id].start_position;
    this.room_users[user_id] = room_id;
    this.rooms[room_id].users.push(new_user);
  },

  move_chatroom: function(user_id, old_room, new_room) {
    var room_users = this.rooms[old_room].users;
    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        room_users[i].position.x = this.rooms[new_room].start_position;

        this.rooms[new_room].users.push({...room_users[i]});
        delete room_users[i];
      }
    }

    this.room_users[user_id] = new_room;

    return this.rooms[new_room];
  }
};

module.exports = {game_server: GAME_SERVER_MANAGER};
