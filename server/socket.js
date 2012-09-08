
/** 
 * Returns a 'socket' object for the player. 
 * The 'socket' object has the emit() method and several pre-definied communiation methods
 */
module.exports = function(player) {
	var socket = player.getSocket();
	this.emit = function(name, msg) {
		socket.emit(name, msg);
	};
	this.sendInit = function(game) {
		socket.emit('startGame_resp', {gameId:game._id, playerId: player._id, playerNo: player.no, availableActions: player.availableActions });
		socket.emit('uiElement', game.gameField.forPlayer(player));
		socket.emit('card', player.cardHand);
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
	this.sentAuctionComplete = function(msg) {
		socket.emit('auctionComplete', msg);
	}
	return this;
}