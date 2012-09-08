var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildJeweleryCard */
/* No: 300...399 */
/* ------------------------------------------ */
BuildJeweleryCard.Inherits(RentalCard);
function BuildJeweleryCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.JEWELERY);
}

/* ------------------------------------------ */
/* class BuildJeweleryCheapCard */
/* ------------------------------------------ */
BuildJeweleryCheapCard.Inherits(BuildJeweleryCard);
function BuildJeweleryCheapCard(id) {
	this.Inherits(BuildJeweleryCard,id,300,2);
}
BuildJeweleryCheapCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 8) {
		profit = 30;
	}
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 10;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildJeweleryMidCard */
/* ------------------------------------------ */
BuildJeweleryMidCard.Inherits(BuildJeweleryCard);
function BuildJeweleryMidCard(id) {
	this.Inherits(BuildJeweleryCard,id,301,2);
}
BuildJeweleryMidCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 3) {
		profit = 150;
	}
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 6) {
		profit = 60;
	}
	if(field.attachedCard.houseType >= 7 && field.attachedCard.houseType <= 8) {
		profit = 20;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildJeweleryPreCard */
/* ------------------------------------------ */
BuildJeweleryPreCard.Inherits(BuildJeweleryCard);
function BuildJeweleryPreCard(id) {
	this.Inherits(BuildJeweleryCard,id,302,3);
}
BuildJeweleryPreCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType == 1 ) {
		profit = 2000;
	}
	if(field.attachedCard.houseType == 2 ) {
		profit = 100;
	}
	return profit;
};
BuildJeweleryPreCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 15;
	return true;
};
