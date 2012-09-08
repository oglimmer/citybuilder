var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildElectronicCard */
/* No: 400...499 */
/* ------------------------------------------ */
BuildElectronicCard.Inherits(RentalCard);
function BuildElectronicCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.ELECTRONIC);
}

/* ------------------------------------------ */
/* class BuildElectronicSmlCard */
/* ------------------------------------------ */
BuildElectronicSmlCard.Inherits(BuildElectronicCard);
function BuildElectronicSmlCard(id) {
	this.Inherits(BuildElectronicCard,id,400,1);
}
BuildElectronicSmlCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 7) {
		profit = 300;
	}
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 100;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildElectronicLrgCard */
/* ------------------------------------------ */
BuildElectronicLrgCard.Inherits(BuildElectronicCard);
function BuildElectronicLrgCard(id) {
	this.Inherits(BuildElectronicCard,id,401,3);
}
BuildElectronicLrgCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 3) {
		profit = 250;
	}
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 7) {
		profit = 80;
	}
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 30;
	}
	return profit;
};
