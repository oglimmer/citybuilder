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
function BuildLocalLevelCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.LOCALLEVEL);
}

/* ------------------------------------------ */
/* class BuildLocalLevelPoliceCard */
/* ------------------------------------------ */
BuildLocalLevelPoliceCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelPoliceCard(id) {
	this.Inherits(BuildLocalLevelCard,id,600,1);
}
BuildLocalLevelPoliceCard.prototype.getProfit = function(field) {
	return 0;
};
BuildLocalLevelPoliceCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 150;
	return true;
};

/* ------------------------------------------ */
/* class BuildLocalLevelHospitalCard */
/* ------------------------------------------ */
BuildLocalLevelHospitalCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelHospitalCard(id) {
	this.Inherits(BuildLocalLevelCard,id,601,2);
}
BuildLocalLevelHospitalCard.prototype.getProfit = function(field) {
	return 0;
};
BuildLocalLevelHospitalCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 70;
	return true;
};

/* ------------------------------------------ */
/* class BuildLocalLevelFirestationCard */
/* ------------------------------------------ */
BuildLocalLevelFirestationCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelFirestationCard(id) {
	this.Inherits(BuildLocalLevelCard,id,602,3);
}
BuildLocalLevelFirestationCard.prototype.getProfit = function(field) {
	return 0;
};
BuildLocalLevelFirestationCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 30;
	return true;
};

/* ------------------------------------------ */
/* class AddCriminals1Card */
/* ------------------------------------------ */
AddCriminals1Card.Inherits(BuildLocalLevelCard);
function AddCriminals1Card(id) {
	this.Inherits(BuildLocalLevelCard,id,603,2);
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
		throw "housetype must be >= 9";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals1Card.prototype.getProfit = function(field) {
	var profit = 0;
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 3;
	}	
	return profit;
};
AddCriminals1Card.prototype.changeLocalLevel = function(field) {
	field.localLevel -= 105;
	return true;
};
AddCriminals1Card.prototype.getSupplyType = function() {
	return "AddCriminals1Card";
}

/* ------------------------------------------ */
/* class AddCriminals2Card */
/* ------------------------------------------ */
AddCriminals2Card.Inherits(BuildLocalLevelCard);
function AddCriminals2Card(id) {
	this.Inherits(BuildLocalLevelCard,id,604,2);
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
		throw "housetype must be >= 7";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals2Card.prototype.getProfit = function(field) {
	var profit = 0;
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 2;
	}	
	if(field.attachedCard.houseType >= 7 && field.attachedCard.houseType <= 8) {
		profit = 15;
	}	
	return profit;
};
AddCriminals2Card.prototype.changeLocalLevel = function(field) {
	field.localLevel -= 55;
	return true;
};
AddCriminals2Card.prototype.getSupplyType = function() {
	return "AddCriminals2Card";
}

/* ------------------------------------------ */
/* class AddCriminals3Card */
/* ------------------------------------------ */
AddCriminals3Card.Inherits(BuildLocalLevelCard);
function AddCriminals3Card(id) {
	this.Inherits(BuildLocalLevelCard,id,605,2);
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
		throw "housetype must be <= 4";
	}
	return this.parent.play.apply(this, arguments);	
}
AddCriminals3Card.prototype.getProfit = function(field) {
	var profit = 0;
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 2) {
		profit = 1500;
	}	
	if(field.attachedCard.houseType >= 3 && field.attachedCard.houseType <= 4) {
		profit = 200;
	}	
	return profit;
};
AddCriminals3Card.prototype.changeLocalLevel = function(field) {
	field.localLevel -= 5;
	return true;
};
AddCriminals3Card.prototype.getSupplyType = function() {
	return "AddCriminals2Card";
}