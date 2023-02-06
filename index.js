var CHAT_MANAGER = require('./chat_logic.js').chat;

var app_express = {};
var express_ws = {};
var chat_manager = {};

var conversations_socket = {};

function config() {
  // Get  conversation list
  app_express.get('/conversations_list', function(req, res) {
    chat_manager.get_conversations(function(result) {
      var response = {};
      response.result = 'success';
      response.data = result;

      res.send(JSON.stringify(response));
    });
  });

  // Returns the state of the conversation: participants & history of messages
  app_express.get('/get_conversation_data', function(req, res) {
    chat_manager.get_users_on_convo(req.query['convo_id'],
        function(users_result) {
            chat_manager.join_convo(req.query['user_id'],
            req.query['convo_id'],
            function() {
                 chat_manager.get_convo_history_messages(req.params['convo_id'],
                 function(msg_result){
                   var response = {};
                   response.result = 'success';
                   response.users = users_result;
                   response.messages = msg_result;
                   res.send(JSON.stringify(response));
                 });
            });
        });
  });

  app_express.get('/create_conversation', function(req, res) {
      chat_manager.create_conversation(req.query['convo_id'],
        function() {
          var response = {};
          response.result = 'success';

          res.send(JSON.stringify(response));
      });
  });


  app_express.ws('/messages', function(ws, req) {
    ws.on('message', function(msg) {
      // On message cases:
      // Identity message {user_id, conversation_id}
      var msg_obj = JSON.parse(msg);

      // If it and identificaion message, stores the websocket with the user
      // id
      if (msg_obj.type = 'user_declaration') {
        conversations_socket[msg_obj.name] = ws;
      } else {
        // Store the message
        chat_manager.store_message(msg_obj.user_id, msg.conversation_id, msg.message, function() {
          // Relay the message to the other people on the conversation
          var users = chat_manager.get_users_on_convo(msg.conversation_id,
                                                      function(user_list){
                                                        for(var i = 0; i < user_list.length(), i++) {
                                                          conversations_socket[user_list[i]].send(msg);
                                                        }
                                                      });
        });
      }
    });
    ws.on('error', function(err) {
      console.log('Error on ws, probably user disconected');
    });
  });

  app_express.listen(9035, function() {
    console.log("Server listening");
  });

  console.log('Server initiated');
}


function init() {
  var express = require('express');
  app_express = express();
  app_express, express_ws = require('@wll8/express-ws')(app_express);

  console.log('Activate express and websocket');

  // When you stablish the databases connection, launch the server
  chat_manager = CHAT_MANAGER.init(config);
}


init();
