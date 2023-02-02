
var CHAT_MANAGER = {

    init: function(on_finish) {
      var redis = require('redis');
      this.redis_client = redis.createClient();

      this.redis_client.connect().then(on_finish).catch(function(err) { console.log("fef", err); });
      return this;
    },

    get_conversations: function (on_finish) {
      this.redis_client.LRANGE('conversations', 0, -1).then(function(v) {
         on_finish(v);
      });
    },

    create_conversations: function(conversation_name, on_finish) {
      this.redis_client.LPUSH('conversations', conversation_id);
      on_finish();
    },

    get_users_on_convo: function(conversation_id, on_finish) {
      this.redis_client.LRANGE(conversation_id + '_users', 0, -1).then(function(v) {
         on_finish(v);
      }).catch(function(error) {
        console.log(error);
        on_finish([]);
      });
    },

    get_convo_history_messages: function(conversation_id, on_finish) {
      this.redis_client.LRANGE(conversation_id + '_messages', 0, -1).then(function(v) {
         on_finish(v);
      });
    },

    join_convo: function(user_id, conversation_id, on_finish) {
      this.redis_client.LPUSH(conversation_id + '_users', user_id);
      on_finish();

    },

    exit_convo: function(user_id, conversation_id, on_finish) {
    },

    send_message: function(user_id, message, on_finish) {

    }
};

module.exports = {chat: CHAT_MANAGER};
