var USER_MANAGER = {

  init: function(on_finish) {
    var redis = require('redis');
    USER_MANAGER.redis_client = redis.createClient();

    USER_MANAGER.redis_client.connect().then(on_finish).catch(function(err) { console.log("fef", err); });
    return USER_MANAGER;
  },

  register_user: function(user_name, passwd, on_finish) {
     var key = 'user_' + user_name + passwd;
    USER_MANAGER.redis_client.EXISTS(key).then(function(v) {
      // If the user exists
      if (v == 1) {
        // The user already exists on the system
        on_finish(-1);
      } else {
        // Get the next ID on the id_count
        USER_MANAGER.redis_client.INCR('id_count').then(function(new_id) {
          // Set the user with the new ID
          USER_MANAGER.redis_client.SET(key, new_id).then(function(v) {
            on_finish(new_id);
          });
        });
      }
    });
  },

  register: function(token, on_finish) {
     var key = 'user_' + token;
     console.log("Register attempt: ", key);
    USER_MANAGER.redis_client.EXISTS(key).then(function(v) {
      // If the user exists
      if (v == 1) {
        // The user already exists on the system
        on_finish(-1);
      } else {
        // Get the next ID on the id_count
        USER_MANAGER.redis_client.INCR('id_count').then(function(new_id) {
          // Set the user with the new ID
          USER_MANAGER.redis_client.SET(key, new_id).then(function(v) {
            on_finish(new_id);
          });
        });
      }
    });
  },

  // Get the user ID
  login_user: function(user_name, passwd, on_finish) {
    var key = 'user_' + user_name + passwd;
    USER_MANAGER.redis_client.EXISTS(key).then(function(v) {
      // If the user exists
      if (v == 1) {
        USER_MANAGER.redis_client.GET(key).then(function(v) {
         on_finish(v);
        });
      } else {
        on_finish(-1);
      }
    });
  },

  login: function(hash, on_finish) {
    var key = 'user_' + hash;
    console.log("Login attempt: ", key);

    USER_MANAGER.redis_client.EXISTS(key).then(function(v) {
      // If the user exists
      if (v == 1) {
        USER_MANAGER.redis_client.get(key).then(function(v) {
         on_finish(v);
        });
      } else {
        on_finish(-1);
      }
    });
  }
};

module.exports = {users: USER_MANAGER};
