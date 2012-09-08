#!/usr/bin/env node

var log4js = require('log4js');
log4js.clearAppenders();
log4js.configure('./log4js_config.json', { reloadSecs: 300 });

var Config = require('./server/rule_defines.js').Config;
var nano = require('nano')(Config.dbHost);

nano.db.destroy(Config.dbSchema, function() {
  nano.db.create(Config.dbSchema, function() {
    var db = nano.use(Config.dbSchema);
    db.insert({
    	"_id": "_design/game",
    	"language": "javascript",
    	"views": {
    		"allGames": {
    			"map": "function(doc) { if(doc.clazz == 'Game' && doc.gameState == 0) emit(doc._id, doc.playerNames);}"
    		},
    		"playersByGameId": {
    			"map": "function(doc) { if(doc.clazz == 'Player') emit(doc.gameId, doc);}"
    		},
    		"playersBySocketId": {
    			"map": "function(doc) { if(doc.clazz == 'Player') emit(doc.socketId, doc);}"
    		}
    	}
    });
  });
});

require("./server/io.js");
