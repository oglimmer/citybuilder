var Config = require('./config');
var db = require('nano')(Config.db);
var Game = require("./rule_game.js");
var Player = require("./rule_player.js");
var CardStack = require("./rule_cardstack.js");
var GameField = require("./rule_gamefield.js");
var Card = require("./rule_cardstack.js");
var CardFactory = require("./rule_cardfactory.js");
var log4js = require('log4js');
var logger = log4js.getLogger('game');

/* Database Operation class */

var GameManager = {

	createGame : function(onCreated) {
		var newGame = new Game();
		this.storeGame(newGame, null, onCreated);
	},

	deleteGame : function(game) {
		var PlayerManager = require('./rule_playermanager.js');
		PlayerManager.getPlayers(game._id, function(player) {
			db.destroy(player._id,player._rev);
		});		
		db.destroy(game._id,game._rev);
	},

	getGame : async (gameId, onLoad) => {	
		if(typeof gameId === "undefined") {
			logger.error("Error in getGame - gameId is undefined");
			return;
		}		
		try {
			const body = await db.get(gameId, { revs_info: false });
			Game.reinit(body);
			onLoad(body);
		} catch (err) {
			logger.error('[GameManager] - getGame failed for id '+gameId+': ', err.message);
		}

	},

	listAllGames : function(onLoad) {
		db.view("game", "allGames", function(err, body) {
			if (err) {				
				logger.error('[GameManager] - listAllGames failed: ', err.message);
				return;
			}
			var ret = [];
			body.rows.forEach(function(doc) {
      				ret.push({gameId : doc.id, players : doc.value});
    			});
			onLoad(ret);
		});
	},

	storeGame : function(game, prepare, onSuccess, onFail) {
		var prepareAndInsert = function(newGame, directInsert) {
			try {
				var doInsert = true;
				if(prepare != null) {
					var prepareReturn = prepare(newGame);
					// prepareReturn = {true, false, undefined}
					if(typeof(prepareReturn) !== 'undefined') {
						doInsert = prepareReturn;
					}
				}
				if(doInsert) {
					if(directInsert) {
						db.insert(game, storeGameInsert.bind(this));				
					} else {
						this.storeGame(newGame, prepare, onSuccess, onFail);
					}
				} else {
					logger.warn("[prepareAndInsert] stopped due to doInsert==false");	
				}
			} catch(e) {
				logger.error("[prepareAndInsert] Caught exception : " + e);
				if(onFail) {
					onFail(e);
				}
			}		
		};
		var retryAfterFailed = function(newGame) {
			prepareAndInsert.apply(this, [ newGame, false ] );
		};
		var storeGameInsert = function(err, body) {			
			try {
				if (err) {
					logger.error('[storeGameInsert] - storeGame failed. '+(prepare==null?'HARD FAIL!':'will try again...')+' : ', err.message);
					if(prepare != null) {
						this.getGame(game._id, retryAfterFailed.bind(this));
					}
				} else {
					game._id = body.id;
					game._rev = body.rev; // update rev so we can perisit it again
					if(onSuccess) {
						onSuccess(game);
					}
				}
			} catch(e) {
				logger.error("[storeGameInsert] Caught exception : " + e);
				if(onFail) {
					onFail(e);
				}
			}							
		};		
		prepareAndInsert.apply(this, [ game, true ] );
	}
};

module.exports = GameManager