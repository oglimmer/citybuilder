var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildGroceriesCard */
/* No: 100...199 */
/* ------------------------------------------ */
BuildGroceriesCard.Inherits(RentalCard);
function BuildGroceriesCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.GROCERIES);
}

/* ------------------------------------------ */
/* class BuildGroceriesSmCard */
/* ------------------------------------------ */
BuildGroceriesSmCard.Inherits(BuildGroceriesCard);
function BuildGroceriesSmCard(id) {
	this.Inherits(BuildGroceriesCard,id,100,3);
}
BuildGroceriesSmCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 4) {
		profit = 100;
	}
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 8) {
		profit = 20;
	}
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 2;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildGroceriesDisc1Card */
/* ------------------------------------------ */
BuildGroceriesDisc1Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc1Card(id) {
	this.Inherits(BuildGroceriesCard,id,101,1);
}
BuildGroceriesDisc1Card.prototype.getProfit = function(field) {
	var profit = 10;	
	return profit;
};

/* ------------------------------------------ */
/* class BuildGroceriesDisc2Card */
/* ------------------------------------------ */
BuildGroceriesDisc2Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc2Card(id) {
	this.Inherits(BuildGroceriesCard,id,102,1);
}
BuildGroceriesDisc2Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 8) {
		profit = 30;
	}
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 5;
	}	
	return profit;
};

/* ------------------------------------------ */
/* class BuildGroceriesDisc3Card */
/* ------------------------------------------ */
BuildGroceriesDisc3Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc3Card(id) {
	this.Inherits(BuildGroceriesCard,id,103,1);
}
BuildGroceriesDisc3Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 15;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildGroceriesSuperMartCard */
/* ------------------------------------------ */
BuildGroceriesSuperMartCard.Inherits(BuildGroceriesCard);
function BuildGroceriesSuperMartCard(id) {
	this.Inherits(BuildGroceriesCard,id,104,3);
}
BuildGroceriesSuperMartCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 4) {
		profit = 100;
	}
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 7) {
		profit = 35;
	}
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 10;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildGroceriesBioSmCard */
/* ------------------------------------------ */
BuildGroceriesBioSmCard.Inherits(BuildGroceriesCard);
function BuildGroceriesBioSmCard(id) {
	this.Inherits(BuildGroceriesCard,id,105,2);
}
BuildGroceriesBioSmCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 2) {
		profit = 300;
	}
	if(field.attachedCard.houseType >= 3 && field.attachedCard.houseType <= 5) {
		profit = 80;
	}
	return profit;
};
BuildGroceriesBioSmCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 10;
	return true;
};

/* ------------------------------------------ */
/* class BuildGroceriesBioLrgCard */
/* ------------------------------------------ */
BuildGroceriesBioLrgCard.Inherits(BuildGroceriesCard);
function BuildGroceriesBioLrgCard(id) {
	this.Inherits(BuildGroceriesCard,id,106,2);
}
BuildGroceriesBioLrgCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 3) {
		profit = 250;
	}
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 7) {
		profit = 75;
	}
	return profit;
};

