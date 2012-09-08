var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildRestaurantCard */
/* No: 0...99 */
/* ------------------------------------------ */
BuildRestaurantCard.Inherits(RentalCard);
function BuildRestaurantCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.FOOD);
}

/* ------------------------------------------ */
/* class BuildRestaurantItaSmCard */
/* ------------------------------------------ */
BuildRestaurantItaSmCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaSmCard(id) {
	this.Inherits(BuildRestaurantCard,id,0,2);
}
BuildRestaurantItaSmCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 5) {
		profit = 20;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantItaMidCard */
/* ------------------------------------------ */
BuildRestaurantItaMidCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaMidCard(id) {
	this.Inherits(BuildRestaurantCard,id,1,2);
}
BuildRestaurantItaMidCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 2 && field.attachedCard.houseType <= 8) {
		profit = 30;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantItaPreCard */
/* ------------------------------------------ */
BuildRestaurantItaPreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaPreCard(id) {
	this.Inherits(BuildRestaurantCard,id,2,2);
}
BuildRestaurantItaPreCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType == 1) {
		profit = 500;
	}
	if(field.attachedCard.houseType >= 2 && field.attachedCard.houseType <= 5) {
		profit = 100;
	}
	return profit;
};
BuildRestaurantItaPreCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 15;
	return true;
};

/* ------------------------------------------ */
/* class BuildRestaurantGreekMidCard */
/* ------------------------------------------ */
BuildRestaurantGreekMidCard.Inherits(BuildRestaurantCard);
function BuildRestaurantGreekMidCard(id) {
	this.Inherits(BuildRestaurantCard,id,3,3);
}
BuildRestaurantGreekMidCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType <= 5) {
		profit = 45;
	}
	if(field.attachedCard.houseType >= 6 && field.attachedCard.houseType <= 8) {
		profit = 15;
	}
	return profit;
};
BuildRestaurantGreekMidCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 5;
	return true;
};

/* ------------------------------------------ */
/* class BuildRestaurantChinSmCard */
/* ------------------------------------------ */
BuildRestaurantChinSmCard.Inherits(BuildRestaurantCard);
function BuildRestaurantChinSmCard(id) {
	this.Inherits(BuildRestaurantCard,id,4,1);
}
BuildRestaurantChinSmCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 7) {
		profit = 10;
	}
	if(field.attachedCard.houseType >= 3 && field.attachedCard.houseType <= 6) {
		profit = 20;
	}	
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantChinLrgCard */
/* ------------------------------------------ */
BuildRestaurantChinLrgCard.Inherits(BuildRestaurantCard);
function BuildRestaurantChinLrgCard(id) {
	this.Inherits(BuildRestaurantCard,id,5,2);
}
BuildRestaurantChinLrgCard.prototype.getProfit = function(field) {
	var profit = 30;	
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantSteakPreCard */
/* ------------------------------------------ */
BuildRestaurantSteakPreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantSteakPreCard(id) {
	this.Inherits(BuildRestaurantCard,id,6,2);
}
BuildRestaurantSteakPreCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType <= 5) {
		profit = 200;
	}	
	return profit;
};
BuildRestaurantSteakPreCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 10;
	return true;
};

/* ------------------------------------------ */
/* class BuildRestaurantFrePreCard */
/* ------------------------------------------ */
BuildRestaurantFrePreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantFrePreCard(id) {
	this.Inherits(BuildRestaurantCard,id,7,2);
}
BuildRestaurantFrePreCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType <= 2) {
		profit = 1500;
	}	
	return profit;
};
BuildRestaurantFrePreCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 30;
	return true;
};

/* ------------------------------------------ */
/* class BuildRestaurantUSFF1Card */
/* ------------------------------------------ */
BuildRestaurantUSFF1Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF1Card(id) {
	this.Inherits(BuildRestaurantCard,id,8,2);
}
BuildRestaurantUSFF1Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 9) {
		profit = 12;
	}	
	if(field.attachedCard.houseType >= 6 && field.attachedCard.houseType <= 8) {
		profit = 7;
	}	
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantUSFF2Card */
/* ------------------------------------------ */
BuildRestaurantUSFF2Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF2Card(id) {
	this.Inherits(BuildRestaurantCard,id,9,2);
}
BuildRestaurantUSFF2Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 9) {
		profit = 13;
	}	
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 8) {
		profit = 5;
	}	
	return profit;
};

/* ------------------------------------------ */
/* class BuildRestaurantUSFF3Card */
/* ------------------------------------------ */
BuildRestaurantUSFF3Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF3Card(id) {
	this.Inherits(BuildRestaurantCard,id,10,3);
}
BuildRestaurantUSFF3Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType == 9) {
		profit = 12;
	}	
	if(field.attachedCard.houseType >= 6 && field.attachedCard.houseType <= 8) {
		profit = 7;
	}	
	return profit;
};
