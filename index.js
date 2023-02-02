var CHAT_MANAGER = require('./chat_logic.js').chat;

var app_express = {};
var express_ws = {};
var chat_manager = {};

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

  // Join a conversation, and returns the state of the conversation
  app_express.post('/join_conversation', function(req, res) {
    chat_manager.get_users_on_convo(req.params['convo_id'],
        function(users_result) {
            chat_manager.join_convo(req.params['user_id'],
            req.params['convo_id'],
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


  app_express.ws('/test', function(ws, req) {
    ws.on('message', function(msg) {
    });
    ws.on('error', function(err) {
    });
    console.log('new comm', JSON.stringify(ws));
  });

  app_express.listen(9035, function() {
    console.log("Server listening");
  });

  console.log('Server initiated');
}


function init() {
  var express = require('express');
  app_express = express();
  express_ws = require('express-ws')(app_express);

  console.log('Activate express and websocket');

  // When you stablish the databases connection, launch the server
  chat_manager = CHAT_MANAGER.init(config);
}


init();
