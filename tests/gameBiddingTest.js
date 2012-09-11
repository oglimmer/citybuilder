var Game = require("../server/rule_game.js");
var Player = require("../server/rule_player.js");
var PlayerManager = require('../server/rule_playermanager.js');
var GameManager = require('../server/rule_gamemanager.js');

module.exports = {

	bids1Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': '2' };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ [ 'A' ] ]);
		test.done();
	},

	bids2Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': '2', 'B': '1' };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ [ 'A' ], [ 'B' ] ]);
		test.done();
	},

	bids3Simple : function(test) {
		var g = new Game();
		g.biddings = { 'A': '2', 'B': '1', 'C': 3 };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ [ 'C' ], [ 'A' ], [ 'B' ] ]);
		test.done();
	},

	bids2Equal : function(test) {
		var g = new Game();
		g.biddings = { 'A': '2', 'B': '2' };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ [ 'A', 'B' ] ]);
		test.done();
	},

	bids3Equal : function(test) {
		var g = new Game();
		g.biddings = { 'A': '2', 'B': '2', 'C': '2' };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ [ 'A', 'B', 'C' ] ]);
		test.done();
	},

	bids2 : function(test) {
		var g = new Game();
		g.biddings = { 'A': '10', 'B': '5' };
		g.processPostAuctionSelection = function() {};
		g.processAuctionBid();
		test.deepEqual(g.auctionTakeOrder, [ ['A'] , ['B'] ] );
		test.done();
	}
}