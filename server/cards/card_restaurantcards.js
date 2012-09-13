var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildRestaurantCard */
/* No: 0...99 */
/* ------------------------------------------ */
BuildRestaurantCard.Inherits(RentalCard);
function BuildRestaurantCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.FOOD,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildRestaurantItaSmCard */
/* ------------------------------------------ */
BuildRestaurantItaSmCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaSmCard(id) {
	this.Inherits(BuildRestaurantCard,id,0,2,[ {ht:[5,10], pro:20} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantItaMidCard */
/* ------------------------------------------ */
BuildRestaurantItaMidCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaMidCard(id) {
	this.Inherits(BuildRestaurantCard,id,1,2,[ {ht:[2,8], pro:30} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantItaPreCard */
/* ------------------------------------------ */
BuildRestaurantItaPreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantItaPreCard(id) {
	this.Inherits(BuildRestaurantCard,id,2,2,[ {ht:[1], pro:500}, {ht:[2,5], pro:100} ], 15);
}

/* ------------------------------------------ */
/* class BuildRestaurantGreekMidCard */
/* ------------------------------------------ */
BuildRestaurantGreekMidCard.Inherits(BuildRestaurantCard);
function BuildRestaurantGreekMidCard(id) {
	this.Inherits(BuildRestaurantCard,id,3,3,[ {ht:[1,5], pro:45}, {ht:[6,8], pro:15} ], 5);
}

/* ------------------------------------------ */
/* class BuildRestaurantChinSmCard */
/* ------------------------------------------ */
BuildRestaurantChinSmCard.Inherits(BuildRestaurantCard);
function BuildRestaurantChinSmCard(id) {
	this.Inherits(BuildRestaurantCard,id,4,1,[ {ht:[3,6], pro:20}, {ht:[7,10], pro:10} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantChinLrgCard */
/* ------------------------------------------ */
BuildRestaurantChinLrgCard.Inherits(BuildRestaurantCard);
function BuildRestaurantChinLrgCard(id) {
	this.Inherits(BuildRestaurantCard,id,5,2,[ {ht:[1,10], pro:30} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantSteakPreCard */
/* ------------------------------------------ */
BuildRestaurantSteakPreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantSteakPreCard(id) {
	this.Inherits(BuildRestaurantCard,id,6,2,[ {ht:[1,5], pro:200} ], 10);
}

/* ------------------------------------------ */
/* class BuildRestaurantFrePreCard */
/* ------------------------------------------ */
BuildRestaurantFrePreCard.Inherits(BuildRestaurantCard);
function BuildRestaurantFrePreCard(id) {
	this.Inherits(BuildRestaurantCard,id,7,2,[ {ht:[1,2], pro:1500} ], 30);
}

/* ------------------------------------------ */
/* class BuildRestaurantUSFF1Card */
/* ------------------------------------------ */
BuildRestaurantUSFF1Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF1Card(id) {
	this.Inherits(BuildRestaurantCard,id,8,2,[ {ht:[6,8], pro:7}, {ht:[9,10], pro:12} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantUSFF2Card */
/* ------------------------------------------ */
BuildRestaurantUSFF2Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF2Card(id) {
	this.Inherits(BuildRestaurantCard,id,9,2,[ {ht:[5,8], pro:5}, {ht:[9,10], pro:13} ], 0);
}

/* ------------------------------------------ */
/* class BuildRestaurantUSFF3Card */
/* ------------------------------------------ */
BuildRestaurantUSFF3Card.Inherits(BuildRestaurantCard);
function BuildRestaurantUSFF3Card(id) {
	this.Inherits(BuildRestaurantCard,id,10,3,[ {ht:[6,8], pro:7}, {ht:[9,10], pro:12} ], 0);
}

