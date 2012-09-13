var Game = require("../server/rule_game.js");
var Player = require("../server/rule_player.js");
var PlayerManager = require('../server/rule_playermanager.js');
var GameManager = require('../server/rule_gamemanager.js');
var AllCards = require('../server/rule_card.js');

module.exports = {

	twoTypesHit : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [1,10], pro:5}],0);
		var profit = rc.getProfit({attachedCard: { houseType: 5}});
		test.equal(profit, 5);
		test.done();
	},

	oneTypeHit : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [2], pro:5}],0);
		var profit = rc.getProfit({attachedCard: { houseType: 2}});
		test.equal(profit, 5);
		test.done();
	},

	oneTypeNoHit : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [2], pro:5}],0);
		var profit = rc.getProfit({attachedCard: { houseType: 4}});
		test.equal(profit, 0);
		test.done();
	},

	twoTypesNoHit : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [1,9], pro:5}],0);
		var profit = rc.getProfit({attachedCard: { houseType: 10}});
		test.equal(profit, 0);
		test.done();
	},

	twoTypesTwoElementsHit : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [1,5], pro:15},{ht: [6,10], pro:5}],0);
		test.equal(rc.getProfit({attachedCard: { houseType: 1}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 2}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 3}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 4}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 5}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 6}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 7}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 8}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 9}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 10}}), 5);
		test.done();
	},		

	twoTypesTwoElements : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [2,5], pro:15},{ht: [6,9], pro:5}],0);
		test.equal(rc.getProfit({attachedCard: { houseType: 1}}), 0);
		test.equal(rc.getProfit({attachedCard: { houseType: 2}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 3}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 4}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 5}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 6}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 7}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 8}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 9}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 10}}), 0);
		test.done();
	},		

	twoTypesThreeElements : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [2,3], pro:115},{ht: [4,6], pro:15},{ht: [7,9], pro:3}],0);
		test.equal(rc.getProfit({attachedCard: { houseType: 1}}), 0);
		test.equal(rc.getProfit({attachedCard: { houseType: 2}}), 115);
		test.equal(rc.getProfit({attachedCard: { houseType: 3}}), 115);
		test.equal(rc.getProfit({attachedCard: { houseType: 4}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 5}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 6}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 7}}), 3);
		test.equal(rc.getProfit({attachedCard: { houseType: 8}}), 3);
		test.equal(rc.getProfit({attachedCard: { houseType: 9}}), 3);
		test.equal(rc.getProfit({attachedCard: { houseType: 10}}), 0);
		test.done();
	},		

	maxComplex : function(test) {

		var rc = new AllCards.RentalCard(1,1,1,1,[{ht: [2], pro:115},{ht: [3,6], pro:15},{ht: [7,8], pro:5},{ht: [9], pro:3}],0);
		test.equal(rc.getProfit({attachedCard: { houseType: 1}}), 0);
		test.equal(rc.getProfit({attachedCard: { houseType: 2}}), 115);
		test.equal(rc.getProfit({attachedCard: { houseType: 3}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 4}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 5}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 6}}), 15);
		test.equal(rc.getProfit({attachedCard: { houseType: 7}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 8}}), 5);
		test.equal(rc.getProfit({attachedCard: { houseType: 9}}), 3);
		test.equal(rc.getProfit({attachedCard: { houseType: 10}}), 0);
		test.done();
	}			
}