var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');
var log4js = require('log4js');
var logger = log4js.getLogger('card');


var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildLocalLevelCard */
/* No: 600...699 */
/* ------------------------------------------ */
BuildLocalLevelCard.Inherits(RentalCard);
function BuildLocalLevelCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.LOCALLEVEL,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildLocalLevelPoliceCard */
/* ------------------------------------------ */
BuildLocalLevelPoliceCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelPoliceCard(id) {
	this.Inherits(BuildLocalLevelCard,id,600,1,[], 150);
}

/* ------------------------------------------ */
/* class BuildLocalLevelHospitalCard */
/* ------------------------------------------ */
BuildLocalLevelHospitalCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelHospitalCard(id) {
	this.Inherits(BuildLocalLevelCard,id,601,2,[], 70);
}

/* ------------------------------------------ */
/* class BuildLocalLevelFirestationCard */
/* ------------------------------------------ */
BuildLocalLevelFirestationCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelFirestationCard(id) {
	this.Inherits(BuildLocalLevelCard,id,602,3,[], 30);
}

/* ------------------------------------------ */
/* class AddCriminals1Card */
/* ------------------------------------------ */
AddCriminals1Card.Inherits(BuildLocalLevelCard);
function AddCriminals1Card(id) {
	this.Inherits(BuildLocalLevelCard,id,603,2,[ {ht:[9,10], pro:3} ], -105);
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
AddCriminals2Card.Inherits(BuildLocalLevelCard);
function AddCriminals2Card(id) {
	this.Inherits(BuildLocalLevelCard,id,604,2,[ {ht:[7,8], pro:15}, {ht:[9,10], pro:2} ], -55);
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
AddCriminals3Card.Inherits(BuildLocalLevelCard);
function AddCriminals3Card(id) {
	this.Inherits(BuildLocalLevelCard,id,605,2,[ {ht:[1,2], pro:1500}, {ht:[3,4], pro:200} ], -5);
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