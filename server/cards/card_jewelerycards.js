var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildJeweleryCard */
/* No: 300...399 */
/* ------------------------------------------ */
BuildJeweleryCard.Inherits(RentalCard);
function BuildJeweleryCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.JEWELERY,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildJeweleryCheapCard */
/* ------------------------------------------ */
BuildJeweleryCheapCard.Inherits(BuildJeweleryCard);
function BuildJeweleryCheapCard(id) {
	this.Inherits(BuildJeweleryCard,id,300,2,[ {ht:[5,8], pro:30}, {ht:[9,10], pro:10} ], 0);
}

/* ------------------------------------------ */
/* class BuildJeweleryMidCard */
/* ------------------------------------------ */
BuildJeweleryMidCard.Inherits(BuildJeweleryCard);
function BuildJeweleryMidCard(id) {
	this.Inherits(BuildJeweleryCard,id,301,2,[ {ht:[1,3], pro:150}, {ht:[4,6], pro:60}, {ht:[7,8], pro:20} ], 0);
}

/* ------------------------------------------ */
/* class BuildJeweleryPreCard */
/* ------------------------------------------ */
BuildJeweleryPreCard.Inherits(BuildJeweleryCard);
function BuildJeweleryPreCard(id) {
	this.Inherits(BuildJeweleryCard,id,302,3,[ {ht:[1], pro:2000}, {ht:[2], pro:100} ], 15);
}

