var CardFactory = require('./rule_cardfactory.js');
var AllCards = require('./rule_card.js');
var log4js = require('log4js');
var logger = log4js.getLogger('card');


function CardStack() {
	this.cards = [];	
}

CardStack.NUMBER_PER_CARD = 5;

CardStack.prototype.shuffle = function() {
  for(var i =0; i < this.cards.length; i++){
    var rand = Math.floor(Math.random() * this.cards.length);
    var tmp = this.cards[i]; 
    this.cards[i] = this.cards[rand]; 
    this.cards[rand] =tmp;
  }
}

CardStack.prototype.createBlock = function(stage) {
	var id = -1;
	this.cards.forEach(function(e) {
		id = Math.max(e.id,id);
	});
	id++;
	var c = 0;	
	var availCards = CardFactory["availCards"+stage];
	for(var i = 0 ; i < availCards.length ; i++) {
		var defEle = availCards[i];
		for(var j = 0 ; j < (stage==0?1:defEle[1]) ; j++) {
			var card = CardFactory.createCard(id, defEle[0]);
			this.addTop(card);
			id++;
		}
	}
}

CardStack.prototype.create = function(stage, count) {
	var c = 0;	
	while(c++ < count) {
		this.createBlock(stage);
	}
	logger.debug("[CardStack::create] stack created. New size:" + this.cards.length);
	this.shuffle();
}

CardStack.prototype.clear = function() {
	this.cards = [];
}

CardStack.prototype.length = function() {
	return this.cards.length;
}

CardStack.prototype.addTop = function(c) {
	this.cards.push(c);
}

CardStack.prototype.removeTop = function() {
	var topCard = this.cards.pop();
	return topCard;
}

CardStack.prototype.removeCardById = function(cardId) {
	if(typeof cardId === "undefined") logger.error("Error in removeCardById - cardId is undefined");
	for(var i = 0 ; i < this.cards.length ; i++ ) {
		if(this.cards[i].id == cardId) {
			this.cards.splice(i,1);
			break;
		}
	}
}

CardStack.prototype.getById = function(cardId) {
	if(typeof cardId === "undefined") logger.error("Error in getById - cardId is undefined");
	for(var i = 0 ; i < this.cards.length ; i++ ) {
		if(this.cards[i].id == cardId) {
			return this.cards[i];
		}
	}
}

CardStack.reinit = function(body) {
	body.__proto__ = CardStack.prototype;
	for( var i = 0 ; i < body.cards.length ; i++ ) {
		AllCards.Card.reinit(body.cards[i]);
	}	
}

module.exports = CardStack;