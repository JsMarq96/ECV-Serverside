var GAME_SERVER_MANAGER = {

  init: function() {
    GAME_SERVER_MANAGER.rooms = {};
    GAME_SERVER_MANAGER.user_room_id = {};
    GAME_SERVER_MANAGER.user_id_name = {};

    // Config default room structure
    GAME_SERVER_MANAGER.starting_room = "main_lobby";
    GAME_SERVER_MANAGER.add_room(GAME_SERVER_MANAGER.starting_room, "imgs/jainine-heese-lobby.png", 0.0);
    GAME_SERVER_MANAGER.add_room("room_1", "imgs/jainine-hesee-room1.png", 0.0);
    GAME_SERVER_MANAGER.add_room("room_2", "imgs/janine-hesee-room2.png", 0.0);

    // DOORS
    GAME_SERVER_MANAGER.add_door_to_room("main_lobby", "room_1", -359, 78);
    GAME_SERVER_MANAGER.add_door_to_room("main_lobby", "room_2", -70, 78);
    GAME_SERVER_MANAGER.add_door_to_room("room_1", "main_lobby", 40, 78);
    GAME_SERVER_MANAGER.add_door_to_room("room_2", "main_lobby", 40, 78);

    return GAME_SERVER_MANAGER;
  },

  room_template: {
    users:[],
    back_img: '',
    start_position: 0.0,
    doors:[]
  },

  user_template: {
    id: 0,
    position: 0,
    item_on_hand: {}
  },

  set_user_position: function(user_id, new_position) {
    var room = GAME_SERVER_MANAGER.rooms[GAME_SERVER_MANAGER.user_room_id[user_id]];
    if (room == null) {
      return;
    }
    var room_users = room.users;

     for(var i = 0; i < room_users.length; i++) {
       if (user_id.localeCompare(room_users[i].id) == 0) {
         room_users[i].position = new_position;
         break;
       }
     }
  },

  add_door_to_room: function(starting_room, other_side_room, pos_x, pos_y) {
    GAME_SERVER_MANAGER.rooms[starting_room].doors.push({'to': other_side_room,
                                                         'pos_x': pos_x,
                                                         'pos_y':pos_y });
  },

  add_room: function(name, back_img, starting_pos) {
    var room_obj = {... GAME_SERVER_MANAGER.room_template};

    room_obj.name = name;
    room_obj.back_img = back_img;
    room_obj.start_position = starting_pos;
    room_obj.doors = [];
    room_obj.users = [];

    GAME_SERVER_MANAGER.rooms[name] = room_obj;
  },


  get_users_on_chatroom: function(room_id, on_finish) {
    return GAME_SERVER_MANAGER.rooms[room_id].users;
  },
  get_users_id_on_chatroom: function(room_id) {
    if (!GAME_SERVER_MANAGER.rooms.hasOwnProperty(room_id)) {
      return;
    }
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
        user_pos = room_users[i].position;
      }
    }

    // Find the users near the user
    for(var i = 0; i < room_users.length; i++) {
      // Skip the current user
      if (room_users[i].id == user_id) {
        continue;
      }

      // If its near, or less the max distance, add to the list
      if (Math.abs(room_users[i].position - user_pos) < distance) {
        near_user_id_list.push(room_users[i].id);
      }
    }

    return near_user_id_list;
  },

  add_user: function(user_id, style) {
    GAME_SERVER_MANAGER.users[user_id] = {... self.user_template};
    GAME_SERVER_MANAGER.users[user_id].style = style;
  },

  remove_user: function(user_id, room_id) {
    if (!GAME_SERVER_MANAGER.rooms.hasOwnProperty(room_id)) {
      return;
    }
    console.log(room_id, user_id);
    var room_users = GAME_SERVER_MANAGER.rooms[room_id].users;

    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id == user_id) {
        room_users.splice(i, 1); // Remove user
      }
    }
  },

  join_chatroom: function(user_id, room_id, name, style) {
    var new_user = { ... GAME_SERVER_MANAGER.user_template}
    new_user.id = user_id;
    new_user.position = GAME_SERVER_MANAGER.rooms[room_id].start_position;
    new_user.name = name;
    new_user.style = style;
    GAME_SERVER_MANAGER.user_room_id[user_id] = room_id;
    GAME_SERVER_MANAGER.rooms[room_id].users.push(new_user);
    GAME_SERVER_MANAGER.user_id_name[user_id] = name;
  },

  move_chatroom: function(user_id, old_room, new_room) {
    var room_users = GAME_SERVER_MANAGER.rooms[old_room].users;
    // Find the user's position
    for(var i = 0; i < room_users.length; i++) {
      if (room_users[i].id.localeCompare(user_id) == 0) {
        room_users[i].position = GAME_SERVER_MANAGER.rooms[new_room].start_position;

        GAME_SERVER_MANAGER.rooms[new_room].users.push({...room_users[i]});
        room_users.splice(i, 1);
        break;
      }
    }

    GAME_SERVER_MANAGER.user_room_id[user_id] = new_room;

    return GAME_SERVER_MANAGER.rooms[new_room];
  }
};

module.exports = {game_server: GAME_SERVER_MANAGER};
