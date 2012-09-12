
/** 
 * Returns a 'socket' object for the player. 
 * The 'socket' object has the emit() method and several pre-definied communiation methods
 */
module.exports = function(player) {
	var socket = player.getSocket();
	this.emit = function(name, msg) {
		socket.emit(name, msg);
	};
	this.sendInitUIElements = function(game) {
		socket.emit('uiElement', game.gameField.forPlayer(player));
		socket.emit('showFieldPane', { gameState : game.gameState });
	};
	this.sendToAllPlayersInGame = function(getData) {
		var PlayerManager = require("./rule_playermanager.js");
		PlayerManager.getPlayers(player.gameId, function(aPlayer) {
			var data = getData(aPlayer);
			aPlayer.getSocket().emit(data.msg, data.payLoad);
		});		
	};
	this.startAuction = function(newTurnData) {
		socket.emit('onStartAuction_resp', newTurnData);
	};
	this.sendEndGame = function(winner) {
		socket.emit('gamedEnded', winner);
	};
	this.sendPostAuctionSelection = function(msg) {
		socket.emit('postAuctionSelection', msg);
	}
	this.sentshowFieldPane = function(msg) {
		socket.emit('showFieldPane', msg);
	}
	return this;
}