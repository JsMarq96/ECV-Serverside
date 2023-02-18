var CHAT_MANAGER = require('./chat_logic.js').chat;
var USER_MANAGER = require('./user_manager.js').users;
var GAME_MANAGER = require('./game_logic.js').game_server;

var app_express = {};
var express_ws = {};
var chat_manager = {};

var conversations_socket = {};

GAME_MANAGER.init();
USER_MANAGER.init();

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


   app_express.get('/register', function(req, res) {

     USER_MANAGER.login(req.data, function(result) {
       if (result != -1) {
         // User has already logged in
         res.send(JSON.stringify({'result':'error', 'message':'User already exists on the system'}));
       } else {
         // Register user
         USER_MANAGER.register(req.data, function(result_id) {
           res.send(JSON.stringify({'result':'success'}));
         });
       }
     });
  });

  // For the ROOM ECV
  app_express.ws('/messages', function(ws, req) {
    ws.on('message', function(msg) {
      // On message cases:
      var msg_obj = JSON.parse(msg);

      // Message types:
      // - Login
      // - Move request
      // - Send message
      // - Send close message
      // - Change room

      if (msg_obj.type.localeCompare("login") == 0) {
        USER_MANAGER.login(msg_obj.data, function(result) {
          // Error login in
          if (result == -1) {
            ws.send(JSON.stringify({'type':'error'}));
          } else {
            // Success login in
            ws._user_id = result;
            conversations_socket[result] = ws;

            GAME_MANAGER.join_chatroom(result, GAME_MANAGER.starting_room);

            // Send the room data
            ws.send(JSON.stringify({'type':'logged_in', 'id': result, 'room': GAME_MANAGER.rooms[GAME_MANAGER.starting_room]}));
          }
        });
      } else if (msg_obj.type.localeCompare("message") == 0) {
        var user_ids = GAME_MANAGER.get_users_id_on_chatroom(GAME_MANAGER.user_room_id[ws._user_id]);

        for(var i = 0; i  < user_ids.length; i++) {
          conversations_socket[user_ids[i]].send(JSON.stringify({'type':'new_message', 'from': ws._user_id, 'message':msg_obj.message}));
        }
      } else if (msg_obj.type.localeCompare("close_message") == 0) {
        var user_ids = GAME_MANAGER.get_users_id_on_chatroom_near_me(GAME_MANAGER.user_room_id[ws._user_id], ws._user_id, 200);

        for(var i = 0; i  < user_ids.length; i++) {
          conversations_socket[user_ids[i]].send(JSON.stringify({'type':'new_message', 'message':msg_obj.message}));
        }
      } else if (msg_obj.type.localeCompare("change_room") == 0) {

      } else if (msg_obj.type.localeCompare("updated_position") == 0) {
        // Update the position on the server, and then send the positions to the users
        // that are in teh same room, to their sockets
        GAME_MANAGER.set_user_position(ws._user_id, msg_obj.position);
        var user_ids = GAME_MANAGER.get_users_id_on_chatroom(GAME_MANAGER.user_room_id[ws._user_id]);
        var obj = {'type':'move_character', 'user_id': ws._user_id, 'position': msg_obj.position};

        var result_msg = JSON.stringify(obj);

        for(var i = 0; i < user_ids.length; i++) {
          conversations_socket[user_ids[i]].send(result_msg);
        }
      }
    });
    ws.on('error', function(err) {
      console.log('Error on ws');
      // TODO remove the user from the rooms
      GAME_MANAGER.remove_user(ws._user_id, GAME_MANAGER.user_room_id[ws._user_id]);
    });

    ws.on('close', function(err) {
      console.log('User disconected');
      // TODO remove the user from the rooms
      GAME_MANAGER.remove_user(ws._user_id, GAME_MANAGER.user_room_id[ws._user_id]);
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
