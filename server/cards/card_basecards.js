var FieldType = require("../rule_defines.js").FieldType;
var Field = require('../rule_field.js');
var log4js = require('log4js');
var logger = log4js.getLogger('card');


Function.prototype.Inherits = function(parent) {
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
	module.exports[this.name] = this;
};

/* ------------------------------------------ */
/* class BaseObject */
/* ------------------------------------------ */
function BaseObject() {
}
BaseObject.prototype.Inherits = function(parent) {
	if(arguments.length > 1) {
		parent.apply(this, Array.prototype.slice.call(arguments, 1) );
	} else {      
		parent.call(this);
	}
};

/* ------------------------------------------ */
/* class Card */
/* ------------------------------------------ */
Card.Inherits(BaseObject);
function Card(id,no) {
	this.clazz = "Card";
	this.id = id; // unique card id (identifies the object's instance)
	this.no = no; // card no (identifies the card)
	this.title = 'c'+no+'_1';
	this.text = 'c'+no+'_2';
	this.actionBit = 0;
	this.playType = 0; // 0 = plays direct, 1 = plays via target selection
}

Card.reinit = function(card) {
	var Cards = require("../rule_card.js");
	var CardFactory = require('../rule_cardfactory.js');
	card.__proto__ = Cards[CardFactory.classNames["id"+card.no]].prototype;
}
Card.forEachField = function(range, field, fields, perField) {
	for(var x = -range ; x <= range ; x++) {
		for(var y = -range ; y <= range ; y++) {
			if(x!=0 || y!=0) {
				var surroundingElement = fields[(field.x+x)+":"+(field.y+y)];
				if(typeof surroundingElement !== 'undefined') {
					perField(surroundingElement);
				}
			}
		}
	}
};
//Card.prototype.play = function() {
//	return { changedFields : {}, secretPlay : false};
//}
/* ------------------------------------------ */
/* class RentalCard */
/* ------------------------------------------ */
RentalCard.Inherits(Card);
function RentalCard(id,no,range,type) {
	this.Inherits(Card,id,no);
	this.range = range;
	this.type = type;
	this.actionBit = 1;
	this.playType = 1;
}
RentalCard.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED',
		range : this.range
		//buildspace : '1x1'		
	};
};
RentalCard.prototype.play = function(field, player) {
	if(field.type == FieldType.HOUSE) {
		field.type = this.type;
		field.owner = player.no;
		field.ownerName = player.playerName;
		field.attachedCard = this;
		field.buildState = 1;
		return { changedFields : Field.asFields(field) , secretPlay : false};
	} else {
		throw "error_field_already_occupied";
	}
};
RentalCard.getTypeFromField = function(field) {
	if(typeof field.attachedCard.getSupplyType !=='undefined') {
		return field.attachedCard.getSupplyType();
	}
	return field.type;
}
RentalCard.prototype.calcSupplies = function(field, fields) {	
	var self = this;
	Card.forEachField(self.range, field, fields, function(surroundingElement) {
		if(surroundingElement.type == FieldType.HOUSE) {
			if(typeof surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] === 'undefined') {
				surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] = 0;
			}
			if(self.getProfit(surroundingElement) > 0) {
				surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]++;
				logger.debug("[RentalCard.calcSupplies] for "+surroundingElement.x+","+surroundingElement.y+" type:"+RentalCard.getTypeFromField(field)+" to "+surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]);
			}			
		}
	});
};
RentalCard.prototype.calcLocalLevel = function(field, fields, changedFields) {	
	var self = this;
	Card.forEachField(self.range, field, fields, function(surroundingElement) {
		if(surroundingElement.type == FieldType.HOUSE) {
			if(typeof self.changeLocalLevel !== 'undefined') {
				if(self.changeLocalLevel(surroundingElement)) {
					logger.debug("[RentalCard.calcLocalLevel] for "+surroundingElement.x+","+surroundingElement.y+" to "+surroundingElement.localLevel);
					changedFields[surroundingElement.x+":"+surroundingElement.y] = surroundingElement;
				}
			}			
		}
	});
};

RentalCard.prototype.calcRent = function(field, fields) {
	var totalRent = 0;
	var self = this;
	Card.forEachField(self.range, field, fields, function(surroundingElement) {
		if(surroundingElement.type == FieldType.HOUSE) {
			if(surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] > 0) {
				var profit = self.getProfit(surroundingElement);
				var rent = profit * surroundingElement.attachedCard.housePopulation / surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)];
				logger.debug("[RentalCard.calcRent] "+surroundingElement.x+","+surroundingElement.y+" Profit:"+profit +", Pop:"+ surroundingElement.attachedCard.housePopulation+", Supply:"+ surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]+", Total:"+rent);
				totalRent += rent;
			} else {
				//logger.debug("no supply for "+surroundingElement.x+","+surroundingElement.y);
			}
		}
	});
	logger.debug("[RentalCard.calcRent] Total rent for "+field.attachedCard.title+" ("+field.x+","+field.y+") = "+totalRent);
	return totalRent;
};


