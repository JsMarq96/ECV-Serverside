
var CHAT_MANAGER = {

    init: function(on_finish) {
      var redis = require('redis');
      this.redis_client = redis.createClient();
      //this.redis_client.on('connect', on_finish);
      //this.redis_client.on('error', function(err) { console.log("Error conenction redis", err);});

      this.redis_client.connect().then(on_finish).catch(function(err) { console.log("fef", err); });
      return this;
    },

    get_conversations: function (on_finish) {
      console.log('test', this.redis_client.lRange);
      this.redis_client.LRANGE('conversations', 0, -1, function(err, v) {
        console.log(err, v);
        if (err) {
          on_finish([]);
        } else {
          on_finish(v);
        }
      });
    },

    create_conversations: function(conversation_name, on_finish) {
      this.redis_client.linsert('conversations', conversation_name);
      on_finish();
    },

    get_users_on_convo: async function(conversation_id, on_finish) {
      var user_count = await this.redis.llen(conversation_id + '_users');
      this.redis_client.lrange(conversation_id + '_users', 0, user_count, function(err, v) {
        if (err) {
          on_finish([]);
        } else {
          on_finish(v);
        }
      });
    },

    get_convo_history_messages: async function(conversation_id, on_finish) {
      var msg_count = await redis.llen(conversation_id + '_messages');
      this.redis_client.lrange(conversation_id + '_messages', 0, msg_count, function(err, v) {
        if (err) {
          on_finish([]);
        } else {
          on_finish(v);
        }
      });
    },

    join_convo: async function(user_id, conversation_id, on_finish) {
      await this.redis_client.linsert(conversation_id + '_users', user_id);
      on_finish();

    },

    exit_convo: function(user_id, conversation_id, on_finish) {
    },

    send_message: function(user_id, message, on_finish) {

    }
};

module.exports = {chat: CHAT_MANAGER};
