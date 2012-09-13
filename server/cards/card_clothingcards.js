var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildClothingCard */
/* No: 200...299 */
/* ------------------------------------------ */
BuildClothingCard.Inherits(RentalCard);
function BuildClothingCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.CLOTHING,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildClothingUltraCheapCard */
/* ------------------------------------------ */
BuildClothingUltraCheapCard.Inherits(BuildClothingCard, 0);
function BuildClothingUltraCheapCard(id) {
	this.Inherits(BuildClothingCard,id,200,2,[ {ht:[9,10], pro:1} ],-5);
}

/* ------------------------------------------ */
/* class BuildClothingCheapCard */
/* ------------------------------------------ */
BuildClothingCheapCard.Inherits(BuildClothingCard);
function BuildClothingCheapCard(id) {
	this.Inherits(BuildClothingCard,id,201,2,[ {ht:[5,7], pro:30}, {ht:[8,10], pro:10} ], 0);
}

/* ------------------------------------------ */
/* class BuildClothingCheapLrgCard */
/* ------------------------------------------ */
BuildClothingCheapLrgCard.Inherits(BuildClothingCard);
function BuildClothingCheapLrgCard(id) {
	this.Inherits(BuildClothingCard,id,202,3,[ {ht:[4,6], pro:30}, {ht:[7,8], pro:10}, {ht:[9,10], pro:5} ], 0);
}

/* ------------------------------------------ */
/* class BuildClothingCheapYoungCard */
/* ------------------------------------------ */
BuildClothingCheapYoungCard.Inherits(BuildClothingCard);
function BuildClothingCheapYoungCard(id) {
	this.Inherits(BuildClothingCard,id,203,2,[ {ht:[5], pro:45}, {ht:[6,8], pro:10}, {ht:[9,10], pro:12} ], 0);
}

/* ------------------------------------------ */
/* class BuildClothingLux1Card */
/* ------------------------------------------ */
BuildClothingLux1Card.Inherits(BuildClothingCard);
function BuildClothingLux1Card(id) {
	this.Inherits(BuildClothingCard,id,204,1,[ {ht:[1,2], pro:100}, {ht:[3,6], pro:35} ],5);
}

/* ------------------------------------------ */
/* class BuildClothingLux2Card */
/* ------------------------------------------ */
BuildClothingLux2Card.Inherits(BuildClothingCard);
function BuildClothingLux2Card(id) {
	this.Inherits(BuildClothingCard,id,205,2,[ {ht:[1,2], pro:1600} ], 10);
}

/* ------------------------------------------ */
/* class BuildClothingFatCard */
/* ------------------------------------------ */
BuildClothingFatCard.Inherits(BuildClothingCard);
function BuildClothingFatCard(id) {
	this.Inherits(BuildClothingCard,id,206,2,[ {ht:[2,3], pro:150}, {ht:[4,7], pro:45}, {ht:[8,10], pro:7} ], 0);
}

/* ------------------------------------------ */
/* class BuildClothingRegLrgCard */
/* ------------------------------------------ */
BuildClothingRegLrgCard.Inherits(BuildClothingCard);
function BuildClothingRegLrgCard(id) {
	this.Inherits(BuildClothingCard,id,207,2,[ {ht:[2,4], pro:250}, {ht:[5,7], pro:30} ], 0);
}

/* ------------------------------------------ */
/* class BuildClothingTeenPreCard */
/* ------------------------------------------ */
BuildClothingTeenPreCard.Inherits(BuildClothingCard);
function BuildClothingTeenPreCard(id) {
	this.Inherits(BuildClothingCard,id,208,4,[ {ht:[3], pro:250}, {ht:[4], pro:50} ], 5);
}




