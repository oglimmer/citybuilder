var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildClothingCard */
/* No: 200...299 */
/* ------------------------------------------ */
BuildClothingCard.Inherits(RentalCard);
function BuildClothingCard(id,no,range) {
	this.Inherits(RentalCard,id,no,range,FieldType.CLOTHING);
}

/* ------------------------------------------ */
/* class BuildClothingUltraCheapCard */
/* ------------------------------------------ */
BuildClothingUltraCheapCard.Inherits(BuildClothingCard);
function BuildClothingUltraCheapCard(id) {
	this.Inherits(BuildClothingCard,id,200,2);
}
BuildClothingUltraCheapCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 30;
	}
	return profit;
};
BuildClothingUltraCheapCard.prototype.changeLocalLevel = function(field) {
	field.localLevel -= 5;
	return true;
};

/* ------------------------------------------ */
/* class BuildClothingCheapCard */
/* ------------------------------------------ */
BuildClothingCheapCard.Inherits(BuildClothingCard);
function BuildClothingCheapCard(id) {
	this.Inherits(BuildClothingCard,id,201,2);
}
BuildClothingCheapCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 7) {
		profit = 30;
	}
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 10;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildClothingCheapLrgCard */
/* ------------------------------------------ */
BuildClothingCheapLrgCard.Inherits(BuildClothingCard);
function BuildClothingCheapLrgCard(id) {
	this.Inherits(BuildClothingCard,id,202,3);
}
BuildClothingCheapLrgCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 6) {
		profit = 30;
	}
	if(field.attachedCard.houseType >= 7 && field.attachedCard.houseType <= 8) {
		profit = 10;
	}
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 5;
	}	
	return profit;
};

/* ------------------------------------------ */
/* class BuildClothingCheapYoungCard */
/* ------------------------------------------ */
BuildClothingCheapYoungCard.Inherits(BuildClothingCard);
function BuildClothingCheapYoungCard(id) {
	this.Inherits(BuildClothingCard,id,203,2);
}
BuildClothingCheapYoungCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType == 5) {
		profit = 45;
	}
	if(field.attachedCard.houseType >= 6 && field.attachedCard.houseType <= 8) {
		profit = 10;
	}
	if(field.attachedCard.houseType >= 9 && field.attachedCard.houseType <= 10) {
		profit = 12;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildClothingLux1Card */
/* ------------------------------------------ */
BuildClothingLux1Card.Inherits(BuildClothingCard);
function BuildClothingLux1Card(id) {
	this.Inherits(BuildClothingCard,id,204,1);
}
BuildClothingLux1Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 2) {
		profit = 100;
	}
	if(field.attachedCard.houseType >= 3 && field.attachedCard.houseType <= 6) {
		profit = 35;
	}
	return profit;
};
BuildClothingLux1Card.prototype.changeLocalLevel = function(field) {
	field.localLevel += 5;
	return true;
};

/* ------------------------------------------ */
/* class BuildClothingLux2Card */
/* ------------------------------------------ */
BuildClothingLux2Card.Inherits(BuildClothingCard);
function BuildClothingLux2Card(id) {
	this.Inherits(BuildClothingCard,id,205,2);
}
BuildClothingLux2Card.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 1 && field.attachedCard.houseType <= 2) {
		profit = 1600;
	}
	return profit;
};
BuildClothingLux2Card.prototype.changeLocalLevel = function(field) {
	field.localLevel += 10;
	return true;
};

/* ------------------------------------------ */
/* class BuildClothingFatCard */
/* ------------------------------------------ */
BuildClothingFatCard.Inherits(BuildClothingCard);
function BuildClothingFatCard(id) {
	this.Inherits(BuildClothingCard,id,206,2);
}
BuildClothingFatCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 2 && field.attachedCard.houseType <= 3) {
		profit = 150;
	}
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 7) {
		profit = 45;
	}
	if(field.attachedCard.houseType >= 8 && field.attachedCard.houseType <= 10) {
		profit = 7;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildClothingRegLrgCard */
/* ------------------------------------------ */
BuildClothingRegLrgCard.Inherits(BuildClothingCard);
function BuildClothingRegLrgCard(id) {
	this.Inherits(BuildClothingCard,id,207,2);
}
BuildClothingRegLrgCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 2 && field.attachedCard.houseType <= 4) {
		profit = 250;
	}
	if(field.attachedCard.houseType >= 5 && field.attachedCard.houseType <= 7) {
		profit = 100;
	}
	return profit;
};

/* ------------------------------------------ */
/* class BuildClothingTeenPreCard */
/* ------------------------------------------ */
BuildClothingTeenPreCard.Inherits(BuildClothingCard);
function BuildClothingTeenPreCard(id) {
	this.Inherits(BuildClothingCard,id,208,4);
}
BuildClothingTeenPreCard.prototype.getProfit = function(field) {
	var profit = 0;	
	if(field.attachedCard.houseType >= 3 && field.attachedCard.houseType <= 3) {
		profit = 250;
	}
	if(field.attachedCard.houseType >= 4 && field.attachedCard.houseType <= 4) {
		profit = 50;
	}
	return profit;
};
BuildClothingTeenPreCard.prototype.changeLocalLevel = function(field) {
	field.localLevel += 5;
	return true;
};




