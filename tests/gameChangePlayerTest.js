var Game = require("../server/rule_game.js");
var Player = require("../server/rule_player.js");
var PlayerManager = require('../server/rule_playermanager.js');
var GameManager = require('../server/rule_gamemanager.js');

module.exports = {
	setUp: function (callback) {

		// THIS IS THE USED GAME
		this.game = new Game();
		this.game._id = 'gameFakeId';

		var self = this;

		// WHEN STORE A PLAYER, CREATE AN ID THE FIRST TIME
		PlayerManager.storePlayer = function(player, prepare, onSuccess) {
			if(prepare!=null) {
				prepare(player);
			}
			if(player._id === null || typeof(player._id) === 'undefined') {
				player._id = 'fakeId';
			}
			if(typeof onSuccess !== 'undefined') {
				onSuccess(player);
			}
		}

		// WHEN YOU TRY TO LOAD A PLAYER FROM DB RETURN THE "THIS.PLAYER"
		PlayerManager.getPlayerBySocketId = function(socketId, onLoad) {
			onLoad(self.player);
		}

		// WHEN YOU TRY TO LOAD A GAME FROM DB RETURN THE ONE INSTANCE FROM ABOVE
		GameManager.getGame = function(gameId, onLoad) {
			onLoad(self.game);
		}

		// WHEN YOU TRY TO STORE A GAME, DO NOTHING AT ALL
		GameManager.storeGame = function(game, prepare, onSuccess) {
			if(prepare!=null) {
				prepare(game);
			}
			if(typeof onSuccess !== 'undefined') {
				onSuccess(game);
			}
		}
		callback();
	},
	changePlayer : function(test) {
		var self = this;

		// CREATE A NEW PLAYER AND REGISTER IN THE GAME
		self.game.createPlayer("socket","player", function(createdPlayer) {

			// SAVE THIS NEW PLAYER IN "THIS.PLAYER" (SO THE PLAYERMANAGER MOCKS USE IT)
			self.player = createdPlayer;

			test.deepEqual(self.game.playerIds,{ "0": "fakeId" });
			test.deepEqual(self.game.playerNames,['player']);
			test.deepEqual(self.game.playersOnTurn,['fakeId']);
			test.ok(createdPlayer.socketId !== null);
	
			Game.removePlayer("socket", function(loadedGame) {
				
				test.deepEqual(loadedGame.playerIds,{ });
				test.deepEqual(loadedGame.playerNames,[]);
				test.deepEqual(loadedGame.playersOnTurn,[]);
				test.ok(createdPlayer.socketId === null);

				loadedGame.rejoinPlayer("socket", self.player, function(joinedPlayer) {
					
					test.deepEqual(loadedGame.playerIds,{ "0": "fakeId" });
					test.deepEqual(loadedGame.playerNames,['player']);
					test.deepEqual(loadedGame.playersOnTurn,['fakeId']);
					test.ok(joinedPlayer.socketId !== null);

					test.done();	
				})			

			});

		});
	}

}