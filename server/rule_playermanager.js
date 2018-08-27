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

var PlayerManager = {

	getPlayer : function(playerId, onLoad) {
		if(typeof playerId === "undefined") {
			logger.error("Error in getPlayer - playerId is undefined");
		}
		db.get(playerId, { revs_info: false }, function(err, body) {
			if (err) {
				logger.error("[PlayerManager] - failed to load player with id " + playerId + " : " + err.message);
				return;
			}	
			Player.reinit(body);
			onLoad(body);
		});
	},

	getOtherPlayers : function(player, perRow) {
		this.getPlayers(player.gameId, function(loadedPlayer) {
			if(loadedPlayer.no !== player.no) {
				perRow(loadedPlayer);
			}
		});		
	},

	getPlayers : function(gameId, perRow, allRows) {
		if(typeof gameId === "undefined") {
			logger.error("Error in getPlayers - gameId is undefined");
		}
		db.view("game", "playersByGameId", { key : gameId }, function(err, body) {
			if (err) {
				logger.error('[PlayerManager] - getPlayers failed: ', err.message);
				return;
			}
			var fixedAllPlayers = [];
			body.rows.forEach(function(doc) {
				var loadedPlayer = doc.value;
				Player.reinit(loadedPlayer);
				if(perRow != null) {
					perRow(loadedPlayer);
				}
				fixedAllPlayers.push(loadedPlayer);
			});
			if(typeof allRows !== 'undefined' && allRows !== null) {

				// add a method to retrieveByPlayerNo
				fixedAllPlayers.getPlayerByNo = function(playerNo) {
					for(var i = 0 ; i < fixedAllPlayers.length ; i++) {
						var p = fixedAllPlayers[i];
						if(p.no == playerNo) {
							return p;
						}
					}
					logger.error("player not found with no="+playerNo);
				};	
				fixedAllPlayers.getPlayerById = function(playerId) {
					for(var i = 0 ; i < fixedAllPlayers.length ; i++) {
						var p = fixedAllPlayers[i];
						if(p._id == playerId) {
							return p;
						}
					}
					logger.error("player not found with id="+getPlayerById);
				};
				fixedAllPlayers.asIdArray = function() {
					var retObj = [];
					for(var i = 0 ; i < fixedAllPlayers.length ; i++) {
						var p = fixedAllPlayers[i];
						retObj.push(p._id);
					}
					return retObj;	
				};
							
				allRows(fixedAllPlayers);
			}
		});
	},	

	getPlayerBySocketId : function(socketId, onLoad) {
		if(typeof socketId === "undefined") {
			logger.error("Error in getPlayerBySocketId - socketId is undefined");
		}
		db.view('game', 'playersBySocketId', {key : socketId}, function(err, body) {
			if(err) {
				logger.error('[PlayerManager] - getPlayerBySocketId failed: ', err.message);
				return;
			}
			body.rows.forEach(function(doc) {
				onLoad(doc.value);
			});
		});		
	},

	storePlayer : function(player, prepare, onSuccess) {
		if(prepare!=null) {
			prepare(player);
		}
		db.insert(player, function(err, body) {
			if (err) {
				console.trace("Here I am!")
				logger.error('[PlayerManager] - storePlayer failed: ', err.message);
				if(prepare!=null) {
					this.getGame(game.id, function(newPlayer) {
						prepare(newPlayer);
						this.storePlayer(newPlayer, prepare, onSuccess);
					});
				}
				return;
			}
			player._id = body.id;
			player._rev = body.rev; // update rev so we can perisit it again			
			if(typeof onSuccess !== 'undefined') {
				onSuccess(player);
			}
		});
	}	
};

module.exports = PlayerManager