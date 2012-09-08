var Player = require("./rule_player.js");
var CardStack = require("./rule_cardstack.js");
var GameField = require('./rule_gamefield.js');
var Field = require('./rule_field.js');
var CardFactory = require('./rule_cardfactory.js');
var MonthHelper = require('./rule_dateutil.js');
var FieldType = require("./rule_defines.js").FieldType;
var log4js = require('log4js');
var logger = log4js.getLogger('game');
var AllCards = require('./rule_card.js');

function Game() {
	this.clazz = "Game";
	this.playerIds = {}; // k=player.number, v=player.id
	this.playerNames = [];
	
	this.biddings = {};
	this.auctionTakeOrder = [];
	this.cardsToAuction = [];

	this.maxPlayerNumber = 0;
	this.gameState = 0;
	this.currentDate = new MonthHelper();
	this.gameField = new GameField(this);
	this.cards = new CardStack();
	this.cards.create(0);
	this.initTurn();
}

Game.prototype.startGame = function(playTime) {
	this.playTime = playTime;
	this.gameState = 1;
	this.cards.create(1);
}

Game.prototype.createPlayer = function(socketId, playerName, onCreated) {
	var self = this;
	var newPlayer = new Player(this, socketId, playerName);
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.storePlayer(newPlayer, null, function(savedPlayer) {
		// update Game object with added player (and increased player no)
		var nextPlayerNo;
		GameManager.storeGame(self, function(gameToPrepare) {
			nextPlayerNo = gameToPrepare.maxPlayerNumber++;
			gameToPrepare.playerIds[nextPlayerNo] = savedPlayer._id;			
			gameToPrepare.playerNames.push(playerName);
			gameToPrepare.playersOnTurn.push(savedPlayer._id);
		}, function() {
			// on success save the player again
			PlayerManager.storePlayer(savedPlayer, function(latestPlayer) {
				latestPlayer.no = nextPlayerNo;
			}, function(finalSavedPlayer) {
				onCreated(finalSavedPlayer);
			});			
		});
	})	
};

Game.prototype.rejoinPlayer = function(socketId, player, onSuccess) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	var self = this;
	PlayerManager.storePlayer(player, function(player) {
		player.socketId = socketId;	
	}, function(savedPlayer) {
		GameManager.storeGame(self, function(gameToPrepare) {
			gameToPrepare.playerIds[player.no] = player._id;			
			gameToPrepare.playerNames.push(player.playerName);
			gameToPrepare.playersOnTurn.push(player._id);
		}, function(savedGame) {
			onSuccess(savedPlayer);
		});
	});
};

Game.removePlayer = function(socketId, onSuccess) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.getPlayerBySocketId(socketId, function(player) {			
		PlayerManager.storePlayer(player, function(player) {
			player.socketId = null;	
			GameManager.getGame(player.gameId, function(game) {
				GameManager.storeGame(game, function(gameToPrepare) {
					delete gameToPrepare.playerIds[player.no];
					gameToPrepare.playerNames.removeByObj(player.playerName);
					gameToPrepare.playersOnTurn.removeByObj(player._id);					
				}, function(savedGame) {
					onSuccess(savedGame);
				});
			});
		});
	});
};

Game.prototype.initTurn = function() {
	this.playersOnTurn = [];
	for(var k in this.playerIds) {
		var v = this.playerIds[k];
		this.playersOnTurn.push(v);
	}
}

Game.prototype.setPlayerDone = function(player) {
	for(var i = 0 ; i < this.playersOnTurn.length ; i++) {
		if(this.playersOnTurn[i] == player._id) {
			this.playersOnTurn.splice(i,1);
			break;
		}
	}
}

Game.prototype.allPlayersDone = function() {
	return this.playersOnTurn.length == 0;
}

Game.prototype.checkForNextTurn = function() {	
	var self = this;
	if(self.allPlayersDone()) {
		var PlayerManager = require("./rule_playermanager.js");
		PlayerManager.getPlayers(self._id, null, function(allPlayers) {
			if(self.gameState == 1) {
				self.processNextTurn(allPlayers);
			} else if(self.gameState == 2) {
				self.processAuctionBid();
			} else if(self.gameState == 3) {
				if(self.auctionTakeOrder.length > 0) {
					self.processPostAuctionSelection();
				} else {
					self.processAuctionSelect(allPlayers);
				}
			}
		});
	}
}

Game.prototype.processAuctionSelect = function(allPlayers) {
	this.gameState = 1;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	var self = this;
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player.value);	
		psoc.sentAuctionComplete({ gameState : self.gameState });
	});
}

Game.prototype.processAuctionBid = function() {
	this.gameState = 3;
	this.auctionTakeOrder = [];
	while(Object.keys(this.biddings).length !== 0) {
		var maxBid = -1;
		var maxBidders;
		for(var pId in this.biddings) {
			var bid = parseInt(this.biddings[pId]);
			if(maxBid < bid) {
				maxBid = bid;
				maxBidders = [pId];
			} else if(maxBid == bid) {
				maxBidders.push(pId);
			}
		}
		var self = this;
		maxBidders.forEach(function(oneMaxBidder) {
			delete self.biddings[oneMaxBidder];	
		});
		this.auctionTakeOrder.push(maxBidders);
	}
	this.processPostAuctionSelection();
}

Game.prototype.processPostAuctionSelection = function() {
	/* readies the next player(s) for the given bid
	 * => puts them into playersOnTurn, and send message over */
	var nextPlayerIds = this.auctionTakeOrder.shift();
	var self = this;

	if(typeof(nextPlayerIds) === 'undefined') {
		console.trace("muuuu")
	}

	this.playersOnTurn = JSON.parse(JSON.stringify(nextPlayerIds)); // deep-copy
	
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);

	nextPlayerIds.forEach(function(playerId) {
		var PlayerManager = require("./rule_playermanager.js");
		PlayerManager.getPlayer(playerId, function(player) {			
			var psoc = require('./socket.js')(player);	
			psoc.sendPostAuctionSelection({ gameState : self.gameState, money : player.money });		
		});
	});
}

Game.prototype.removeCardFromAuction = function(cardId) {
	var c = null;
	for(var i = 0 ; i < this.cardsToAuction.length ; i++) {
		if(this.cardsToAuction[i].id == cardId) {
			c = this.cardsToAuction[i];
			this.cardsToAuction.splice(i,1);
		}
	}
	return c;
}

Game.prototype.processNextTurn = function(allPlayers) {
	this.gameState = 2;

	var changedFields = {};

	this.resetSuppliesAndCalcBuildstate(changedFields);

	this.calcLocalLevel(changedFields); // no dependency, set:localLevel

	this.doSocialDowngrades(); // depends on localLevel, set:attachedCard.houseType

	this.calcSupplies(); // depends on profit(attachedCard.houseType), set:supply

	this.calcIncome(allPlayers); // depends on supply and profit(attachedCard.houseType)

	this.currentDate.nextMonth();
	this.playTime--;
	this.initTurn();
	if(this.playTime == 0) {
		this.processEndGame(allPlayers);
	} else {
		var cardsToAuction = [];
		for(var i = 0 ; i < allPlayers.length + 1 ; i++) {
			cardsToAuction.push(this.cards.removeTop());
		}
		this.sendAuction(allPlayers, changedFields, cardsToAuction);
	}	
}

Game.prototype.sendAuction = function(allPlayers, changedFields, cardsToAuction) {
	var self = this;
	self.cardsToAuction = cardsToAuction;
	allPlayers.forEach(function(doc) {
		self.sendAuctionToPlayer(doc.value, changedFields, cardsToAuction);
	});
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(self, null);		
}

Game.prototype.sendAuctionToPlayer = function(player, changedFields, cardsToAuction) {
	player.availableActions |= 1; // a card is deployable
	var newTurnData = this.constructNewTurnData(player, changedFields, cardsToAuction);	
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.storePlayer(player,null, function(savedPlayer) {
		require('./socket.js')(savedPlayer).startAuction(newTurnData);
	});	
}

Game.prototype.processNextTurnDoneLLLLL = function(allPlayers, changedFields) {
	var self = this;
	allPlayers.forEach(function(doc) {
		self.sendNewTurnDataForPlayer(doc.value, changedFields);
	});
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(self, null);		
}

Game.prototype.resetSuppliesAndCalcBuildstate = function(changedFields) {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.buildState == 1) {
			field.buildState++;
			changedFields[field.x+":"+field.y] = field;
		}			
		if(field.type === FieldType.HOUSE) {
			field.attachedCard.supply = [];
			field.localLevel = field.baseLocalLevel;				
		} else {
			//CRAZINESS: add methods to this card
			AllCards.Card.reinit(field.attachedCard);
		}
	}
}

Game.prototype.calcSupplies = function() {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type !== FieldType.HOUSE) {			
			field.attachedCard.calcSupplies(field, this.gameField.fields);
		}
	}
}

Game.prototype.calcLocalLevel = function(changedFields) {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type !== FieldType.HOUSE) {
			field.attachedCard.calcLocalLevel(field, this.gameField.fields, changedFields);
		}
	}
}

Game.prototype.doSocialDowngrades = function() {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type === FieldType.HOUSE) {
			Field.downgrade(field);
		}
	}		
}

Game.prototype.calcIncome = function(allPlayers) {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];
		if(field.type !== FieldType.HOUSE) {
			var p = allPlayers.getPlayer(field.owner);
			p.money += field.attachedCard.calcRent(field, this.gameField.fields);
		}
	}
}

Game.prototype.processEndGame = function(allPlayers) {
	var winner = { player: null, maxMoney : -1, scoreList : [] };
	allPlayers.forEach(function(p) {
		var player = p.value;
		if(player.money > winner.maxMoney) {
			winner.playerName = player.playerName;
			winner.maxMoney = player.money;
		}
		winner.scoreList.push({playerName : player.playerName, money: player.money});
	});			
	allPlayers.forEach(function(p) {
		var player = p.value;
		require('./socket.js')(player).sendEndGame({ winner: winner});				
	});
	var GameManager = require("./rule_gamemanager.js");
	GameManager.deleteGame(this);
}

Game.prototype.constructMsgInfoBar = function(player) {
	return {
		gameState : this.gameState,
		money : player.money,
		playerNumber : this.playerNames.length,
		currentDate : this.currentDate.toString() +" ("+this.playTime+")"
	};
}

Game.prototype.constructNewTurnData = function(player, changedFields, cardsToAuction) {
	return {
		gameState : this.gameState,
		infoBar : this.constructMsgInfoBar(player),
		uiElement : changedFields,
		availableActions : player.availableActions,
		cardsToAuction : cardsToAuction
	};	
}

Game.prototype.setBidding = function(player, bid) {
	logger.debug("Accepted bid for player "+player.playerName+" : -"+bid+"-");
	this.biddings[player._id] = bid;	
}

Game.reinit = function(body) {
	body.__proto__ = Game.prototype;
	CardStack.reinit(body.cards);
	GameField.reinit(body.gameField);
	MonthHelper.reinit(body.currentDate);	
}

module.exports = Game;