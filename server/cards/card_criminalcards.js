var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');
var log4js = require('log4js');
var logger = log4js.getLogger('card');


var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildCriminalCard */
/* No: 800...899 */
/* ------------------------------------------ */
BuildCriminalCard.Inherits(RentalCard);
function BuildCriminalCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.CRIMINAL,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class AddCriminals1Card */
/* ------------------------------------------ */
AddCriminals1Card.Inherits(BuildCriminalCard);
function AddCriminals1Card(id) {
	this.Inherits(BuildCriminalCard,id,800,2,[ {ht:[9,10], pro:3} ], -105);
}
AddCriminals1Card.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED_ABOVE_8',
		range : this.range
		//buildspace : '1x1'		
	};
};
AddCriminals1Card.prototype.play = function(field, player) {
	if(field.attachedCard.houseType < 9) {
		throw "error_housetype_too_low";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals1Card.prototype.getSupplyType = function() {
	return "AddCriminals1Card";
}

/* ------------------------------------------ */
/* class AddCriminals2Card */
/* ------------------------------------------ */
AddCriminals2Card.Inherits(BuildCriminalCard);
function AddCriminals2Card(id) {
	this.Inherits(BuildCriminalCard,id,801,2,[ {ht:[7,8], pro:15}, {ht:[9,10], pro:2} ], -55);
}
AddCriminals2Card.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED_ABOVE_6',
		range : this.range
		//buildspace : '1x1'		
	};
};
AddCriminals2Card.prototype.play = function(field, player) {
	if(field.attachedCard.houseType < 7) {
		throw "error_housetype_too_low";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals2Card.prototype.getSupplyType = function() {
	return "AddCriminals2Card";
}

/* ------------------------------------------ */
/* class AddCriminals3Card */
/* ------------------------------------------ */
AddCriminals3Card.Inherits(BuildCriminalCard);
function AddCriminals3Card(id) {
	this.Inherits(BuildCriminalCard,id,802,2,[ {ht:[1,2], pro:1500}, {ht:[3,4], pro:200} ], -5);
}
AddCriminals3Card.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED_LOWER_5',
		range : this.range
		//buildspace : '1x1'		
	};
};
AddCriminals3Card.prototype.play = function(field, player) {
	if(field.attachedCard.houseType > 4) {
		throw "error_housetype_too_low";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals3Card.prototype.getSupplyType = function() {
	return "AddCriminals2Card";
}