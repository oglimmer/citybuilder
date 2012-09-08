var Config = require('./rule_defines.js').Config;
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

	getGame : function(gameId, onLoad) {	
		if(typeof gameId === "undefined") {
			console.trace("Here I am!");
			throw "Error in getGame - gameId is undefined";
		}		
		db.get(gameId, { revs_info: false }, function(err, body) {
			if (err) {
				logger.error('[GameManager] - getGame failed for id '+gameId+': ', err.message);
				return;
			}	
			Game.reinit(body);
			onLoad(body);
		});
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

	storeGame : function(game, prepare, onSuccess) {
		var self = this;
		var doInsert = true;
		if(prepare!=null) {
			var prepareReturn = prepare(game);
			if(typeof(prepareReturn) !== 'undefined') {
				doInsert = prepareReturn;
			}
		}
		if(doInsert) {
			db.insert(game, function(err, body) {
				if (err) {
					console.trace("Here I am!")
					logger.error('[GameManager] - storeGame failed. '+(prepare==null?'HARD FAIL!':'')+' : ', err.message);
					if(prepare!=null) {
						self.getGame(game._id, function(newGame) {
							var doInsert = prepare(newGame);
							if(typeof(doInsert) === 'undefined' || doInsert) {
								self.storeGame(newGame, prepare, onSuccess);
							}							
						});
					}
					return;
				}
				game._id = body.id;
				game._rev = body.rev; // update rev so we can perisit it again
				if(typeof(onSuccess) !== 'undefined') {
					onSuccess(game);
				}
			});
		}
	}

};

module.exports = GameManager