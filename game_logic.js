var GAME_SERVER_MANAGER = {

    init: function(on_finish) {
      var redis = require('redis');
      this.redis_client = redis.createClient();

      this.redis_client.connect().then(on_finish).catch(function(err) { console.log("fef", err); });
      return this;
    },

    get_chatrooms: function (on_finish) {
      this.redis_client.LRANGE('chat_rooms', 0, -1).then(function(v) {
         on_finish(v);
      });
    },

    create_chatroom: function(chatroom_name, on_finish) {
      this.redis_client.LPUSH('chat_room', chatroom_name);
      on_finish();
    },

    get_users_on_chatroom: function(room_id, on_finish) {
      this.redis_client.LRANGE('chat_' + room_id + '_users', 0, -1).then(function(v) {
         on_finish(v);
      }).catch(function(error) {
        console.log(error);
        on_finish([]);
      });
    },

    get_users_on_chatroom_near_me: function(room_id, user_id, distance, on_finish) {
      this.redis_client.LRANGE('chat_' + room_id + '_users', 0, -1).then(function(v) {
        var user_pos = null;
        var near_user_id_list = [];
        // Find the current user's position
        for(var i = 0; i < v.length; i++) {
          if (v[i].id == user_id) {
            user_pos = v[i].position.x;
          }
        }

        for(var i = 0; i < v.length; i++) {
          // Skip the current user
          if (v[i].id == user_id) {
            continue;
          }

          // If its near, or less the max distance, add to the list
          if (Math.abs(v[i].position.x - user_pos) < distance) {
            near_user_id_list.push(v[i].id);
          }
        }

        on_finish(near_user_id_list);
      }).catch(function(error) {
        console.log(error);
        on_finish([]);
      });
    }

    join_chatroom: function(user_id, room_id, on_finish) {
      this.redis_client.LPUSH('chat_' + room_id + '_users', user_id);
      on_finish();

    }
};

module.exports = {game_server: GAME_SERVER_MANAGER};
