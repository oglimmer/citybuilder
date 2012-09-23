var log4js = require('log4js');
var logger = log4js.getLogger('io');

module.exports = {
    setUp: function (callback) {

		var Config = require('../server/rule_defines.js').Config;
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
		    }, function() {
		    	callback();
		    });
		  });
		});
        
        
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    createGame: function (test) {
        
        var io = {
        	sockets : {       		
        		on : function(name, eventHandler) {
        			this[name] = eventHandler;
        		},
	        	emit : function(name, payLoad) {
	        		if(name == 'waitAddPlayer_resp') {
		        		test.equal(payLoad.playerName, "oli");
		        		test.equal(payLoad.showStartButton, true);
	        		} else {
	        			test.ok(false);
	        		}
	        		test.done();
	        	}
        	}
        }

    	require('../server/ioHandler.js')(io, logger);

        io.sockets.connection(io.sockets);

        io.sockets.createGame_req({ playerName : "oli" });        
    }
};