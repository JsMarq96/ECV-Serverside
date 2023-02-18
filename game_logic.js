var GAME_SERVER_MANAGER = {

  init: function() {
    GAME_SERVER_MANAGER.rooms = {};
    GAME_SERVER_MANAGER.user_room_id = {};

    // Config default room structure
    GAME_SERVER_MANAGER.starting_room = "main_lobby";
    GAME_SERVER_MANAGER.add_room(GAME_SERVER_MANAGER.starting_room, "imgs/jainine-heese-lobby.png", 0.0);

    return GAME_SERVER_MANAGER;
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

  add_room: function(name, back_img, starting_pos) {
    var room_obj = {... GAME_SERVER_MANAGER.room_template};

    room_obj.name = name;
    room_obj.back_img = back_img;
    room_obj.start_position = starting_pos;

    GAME_SERVER_MANAGER.rooms[name] = room_obj;
  },


  get_users_on_chatroom: function(room_id, on_finish) {
    return GAME_SERVER_MANAGER.rooms[room_id].users;
  },
  get_users_id_on_chatroom: function(room_id) {
    var room_users = GAME_SERVER_MANAGER.rooms[room_id].users;
    var user_id_list = [];

    for(var i = 0; i < room_users.length; i++) {
      user_id_list.push(room_users[i].id);
    }

    return user_id_list;
  },

  get_users_ids_on_chatroom_near_me: function(room_id, user_id, distance) {
    var room_users = GAME_SERVER_MANAGER.rooms[room_id].users;
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
    GAME_SERVER_MANAGER.users[user_id] = {... self.user_template};
  },

  remove_user: function(user_id, room_id) {
    var room_users = GAME_SERVER_MANAGER.rooms[room_id].users;

    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        room_users.splice(i, 1); // Remove user
      }
    }
  },

  join_chatroom: function(user_id, room_id) {
    var new_user = { ... GAME_SERVER_MANAGER.user_template}
    new_user.id = user_id;
    new_user.position.x = GAME_SERVER_MANAGER.rooms[room_id].start_position;
    GAME_SERVER_MANAGER.user_room_id[user_id] = room_id;
    GAME_SERVER_MANAGER.rooms[room_id].users.push(new_user);
  },

  move_chatroom: function(user_id, old_room, new_room) {
    var room_users = GAME_SERVER_MANAGER.rooms[old_room].users;
    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        room_users[i].position.x = GAME_SERVER_MANAGER.rooms[new_room].start_position;

        GAME_SERVER_MANAGER.rooms[new_room].users.push({...room_users[i]});
        room_users.splice(i, 1);
      }
    }

    GAME_SERVER_MANAGER.room_users[user_id] = new_room;

    return GAME_SERVER_MANAGER.rooms[new_room];
  }
};

module.exports = {game_server: GAME_SERVER_MANAGER};
