var Config = require('./rule_defines.js').Config;
var db = require('nano')(Config.db);
var CardStack = require("./rule_cardstack.js");
var CardFactory = require("./rule_cardfactory.js");

function Player(game, socketId, playerName) {
	this.clazz = "Player";
	this.gameId = game._id;
	this.socketId = socketId;
	this.playerName = playerName;
	this.money = 0;
	this.availableActions = 1; // a card is deployable
	this.cardHand = new CardStack();
}

Player.prototype.getSocket = function() {
	var io = require("./io.js");	
	var socket;
	if(this.socketId !== null) {
		socket = io.sockets.socket(this.socketId);
	} else {
		socket = {
			emit : function() {}
		}
	}
	return socket;
}

Player.prototype.playCard = function(cardIdToPlay,targetFieldId,onSuccess,onFail) {
	// check if player is able to deploy a card this turn
	var self = this;
	if(self.availableActions & 1 == 0) {
		return;
	}
	var PlayerManager = require("./rule_playermanager.js");
	var GameManager = require("./rule_gamemanager.js");
	// load game by player.gameId
	GameManager.getGame(self.gameId, function(game) {
		var field = null;
		var cardPlayReturn;
		// store the Game with the changed (deployed) field
		GameManager.storeGame(game, 
		function(gameToPrepare) {
			// prepare
			var card = self.cardHand.getById(cardIdToPlay);
			field = gameToPrepare.gameField.fields[targetFieldId];			
			cardPlayReturn = card.play(field, self, gameToPrepare.gameField.fields);			
		}, function(savedGame) {					
			// onSuccess: safe the player with the removed card
			PlayerManager.storePlayer(self, function(playerToPrepare) {
				var card = playerToPrepare.cardHand.getById(cardIdToPlay);
				playerToPrepare.availableActions ^= card.actionBit; // clear deployable action							
				playerToPrepare.cardHand.removeCardById(cardIdToPlay);							
			}, function(savedPlayer) {
				onSuccess(savedPlayer, field, cardPlayReturn);
			});						
		}, function(error) {
			// onFail
			onFail(error);
		});
	});	
}

Player.reinit = function(body) {
	body.__proto__ = Player.prototype;
	CardStack.reinit(body.cardHand);
}

module.exports = Player


