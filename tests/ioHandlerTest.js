var log4js = require('log4js');
var logger = log4js.getLogger('io');

module.exports = {
    setUp: async (callback) => {

  		var Config = require('../server/config');
  		var nano = require('nano')(Config.dbHost);

      try {
        await nano.db.destroy(Config.dbSchema);
      } catch(err) {
        // just ignore
      }

      await nano.db.create(Config.dbSchema);
      await nano.use(Config.dbSchema).insert(fs.readFileSync('../db/_design-game-view.json'));

      callback();
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