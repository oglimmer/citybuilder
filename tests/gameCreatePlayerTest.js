var Game = require("../server/rule_game.js");
var PlayerManager = require('../server/rule_playermanager.js');
var GameManager = require('../server/rule_gamemanager.js');

module.exports = {
	setUp: function (callback) {
		PlayerManager.storePlayer = function(player, prepare, onSuccess) {
			if(prepare!=null) {
				prepare(player);
			}
			player._id = "fakeId"+player.playerName;
			player._rev = "fakeRev"+player.playerName;			
			if(typeof onSuccess !== 'undefined') {
				onSuccess(player);
			}
		}		
		GameManager.storeGame = function(game, prepare, onSuccess) {
			if(prepare!=null) {
				prepare(game);
			}
			game._id = "fakeId";
			game._rev = "fakeRev";
			if(typeof onSuccess !== 'undefined') {
				onSuccess(game);
			}
		}
		callback();
	},
	createPlayer : function(test) {
		var g = new Game();
		g.createPlayer("socket0","fooName", function(player) {
			test.strictEqual(player.no,0);
			test.strictEqual(player.playerName,'fooName');
			test.strictEqual(player.socketId,'socket0');
			test.strictEqual(g.maxPlayerNumber,1);
			test.deepEqual(g.playerIds,{ "0": "fakeIdfooName"});
			test.deepEqual(g.playerNames,['fooName']);
			test.deepEqual(g.playersOnTurn,['fakeIdfooName']);

			g.createPlayer("socket1","barName", function(player) {
				test.strictEqual(player.no,1);
				test.strictEqual(player.playerName,'barName');
				test.strictEqual(player.socketId,'socket1');
				test.strictEqual(g.maxPlayerNumber,2);
				test.deepEqual(g.playerIds,{ "0": "fakeIdfooName", "1": "fakeIdbarName"});
				test.deepEqual(g.playerNames,['fooName','barName']);
				test.deepEqual(g.playersOnTurn,['fakeIdfooName','fakeIdbarName']);
				
				test.done();
			});
		});		
	}

}