var Game = require("../server/rule_game.js");
var Player = require("../server/rule_player.js");
var PlayerManager = require('../server/rule_playermanager.js');
var GameManager = require('../server/rule_gamemanager.js');

var Helper = {

	players : [ 
		{"_id":"A","socketId":"foo1","playerName":"Mr. White","money":150},
		{"_id":"B","socketId":"foo2","playerName":"Mr. Black","money":100},
		{"_id":"C","socketId":"foo3","playerName":"Mr. Green","money":50} 
	],

	getAllPlayers : function(i) {
		var arr = [];
		for(var j = 0 ; j < i ; j++) {
			arr.push(this.players[j]);
		}
		arr.getPlayerByNo = function(playerNo) {
			for(var i = 0 ; i < arr.length ; i++) {
				var p = arr[i];
				if(p.no == playerNo) {
					return p;
				}
			}
			logger.error("player not found with no="+playerNo);
		};	
		arr.getPlayerById = function(playerId) {
			for(var i = 0 ; i < arr.length ; i++) {
				var p = arr[i];
				if(p._id == playerId) {
					return p;
				}
			}
			logger.error("player not found with id="+getPlayerById);
		};
		arr.asIdArray = function() {
			var retObj = [];
			for(var i = 0 ; i < arr.length ; i++) {
				var p = arr[i];
				retObj.push(p._id);
			}
			return retObj;	
		};
		return arr;
	}
}

module.exports = {

	setUp: function (callback) {
		PlayerManager.storePlayer = function(player, prepare, onSuccess) {
		}
		callback();
	},

	bids1Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 5, acutalCost:0} };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(1);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ [ 'A' ] ]);
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-5);
		test.equal(g.biddings['A'].acutalCost, 5);
		test.done();
	},

	bids2Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 2, acutalCost:0}, 'B': {originalBid: 1, acutalCost:0}  };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(2);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ [ 'A' ], [ 'B' ] ]);
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-2);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB);
		test.equal(g.biddings['A'].acutalCost, 2);
		test.equal(g.biddings['B'].acutalCost, 0);
		test.done();
	},

	bids3Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 10, acutalCost:0}, 'B': {originalBid: 5, acutalCost:0}, 'C': {originalBid: 20, acutalCost:0}  };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(3);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		var moneyPlayerC = allPlayers.getPlayerById('C').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ [ 'C' ], [ 'A' ], [ 'B' ] ]);
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-5);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB);
		test.equal(allPlayers.getPlayerById('C').money, moneyPlayerC-20);
		test.equal(g.biddings['A'].acutalCost, 5);
		test.equal(g.biddings['B'].acutalCost, 0);
		test.equal(g.biddings['C'].acutalCost, 20);
		test.done();
	},

	bids2Equal : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 2, acutalCost:0}, 'B': {originalBid: 2, acutalCost:0}  };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(2);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ [ 'A', 'B' ] ]);
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-2);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB-2);
		test.equal(g.biddings['A'].acutalCost, 2);
		test.equal(g.biddings['B'].acutalCost, 2);		
		test.done();
	},

	bids3Equal : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 2, acutalCost:0}, 'B': {originalBid: 2, acutalCost:0}, 'C': {originalBid: 2, acutalCost:0}  };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(3);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		var moneyPlayerC = allPlayers.getPlayerById('C').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ [ 'A', 'B', 'C' ] ]);
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-2);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB-2);
		test.equal(allPlayers.getPlayerById('C').money, moneyPlayerC-2);
		test.equal(g.biddings['A'].acutalCost, 2);
		test.equal(g.biddings['B'].acutalCost, 2);
		test.equal(g.biddings['C'].acutalCost, 2);
		test.done();
	},

	bids2 : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 10, acutalCost:0}, 'B': {originalBid: 5, acutalCost:0}  };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(2);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ ['A'] , ['B'] ] );
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-10);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB-0);
		test.equal(g.biddings['A'].acutalCost, 10);
		test.equal(g.biddings['B'].acutalCost, 0);				
		test.done();
	},

	bids1Missing1 : function(test) {
		var g = new Game();
		g.biddings = { 'A': {originalBid: 10, acutalCost:0} };
		g.doNextAuctionPickCard = function() {};
		var allPlayers = Helper.getAllPlayers(2);
		var moneyPlayerA = allPlayers.getPlayerById('A').money;
		var moneyPlayerB = allPlayers.getPlayerById('B').money;
		g.processAuctionBid(allPlayers);
		test.deepEqual(g.auctionTakeOrder, [ ['A'] , ['B'] ] );
		test.equal(allPlayers.getPlayerById('A').money, moneyPlayerA-10);
		test.equal(allPlayers.getPlayerById('B').money, moneyPlayerB-0);
		test.equal(g.biddings['A'].acutalCost, 10);
		test.equal(g.biddings['B'].acutalCost, 0);				
		test.done();
	}
}