var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildGroceriesCard */
/* No: 100...199 */
/* ------------------------------------------ */
BuildGroceriesCard.Inherits(RentalCard);
function BuildGroceriesCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.GROCERIES,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildGroceriesSmCard */
/* ------------------------------------------ */
BuildGroceriesSmCard.Inherits(BuildGroceriesCard);
function BuildGroceriesSmCard(id) {
	this.Inherits(BuildGroceriesCard,id,100,3,[ {ht:[1,4], pro:100}, {ht:[5,8], pro:20}, {ht:[9,10], pro:2} ], 0);
}

/* ------------------------------------------ */
/* class BuildGroceriesDisc1Card */
/* ------------------------------------------ */
BuildGroceriesDisc1Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc1Card(id) {
	this.Inherits(BuildGroceriesCard,id,101,1,[ {ht:[1,10], pro:10} ], 0);
}

/* ------------------------------------------ */
/* class BuildGroceriesDisc2Card */
/* ------------------------------------------ */
BuildGroceriesDisc2Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc2Card(id) {
	this.Inherits(BuildGroceriesCard,id,102,1,[ {ht:[4,8], pro:30}, {ht:[9,10], pro:5} ], 0);
}

/* ------------------------------------------ */
/* class BuildGroceriesDisc3Card */
/* ------------------------------------------ */
BuildGroceriesDisc3Card.Inherits(BuildGroceriesCard);
function BuildGroceriesDisc3Card(id) {
	this.Inherits(BuildGroceriesCard,id,103,1,[ {ht:[8,10], pro:15} ], 0);
}

/* ------------------------------------------ */
/* class BuildGroceriesSuperMartCard */
/* ------------------------------------------ */
BuildGroceriesSuperMartCard.Inherits(BuildGroceriesCard);
function BuildGroceriesSuperMartCard(id) {
	this.Inherits(BuildGroceriesCard,id,104,3,[ {ht:[1,4], pro:100}, {ht:[5,7], pro:35}, {ht:[8,10], pro:10} ], 0);
}

/* ------------------------------------------ */
/* class BuildGroceriesBioSmCard */
/* ------------------------------------------ */
BuildGroceriesBioSmCard.Inherits(BuildGroceriesCard);
function BuildGroceriesBioSmCard(id) {
	this.Inherits(BuildGroceriesCard,id,105,2,[ {ht:[1,2], pro:300}, {ht:[3,5], pro:80} ], 10);
}

/* ------------------------------------------ */
/* class BuildGroceriesBioLrgCard */
/* ------------------------------------------ */
BuildGroceriesBioLrgCard.Inherits(BuildGroceriesCard);
function BuildGroceriesBioLrgCard(id) {
	this.Inherits(BuildGroceriesCard,id,106,2,[ {ht:[1,3], pro:250}, {ht:[4,7], pro:75} ], 0);
}

