var FieldType = require("../rule_defines.js").FieldType;
var basecards = require('./card_basecards.js');

var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class BuildElectronicCard */
/* No: 400...499 */
/* ------------------------------------------ */
BuildElectronicCard.Inherits(RentalCard);
function BuildElectronicCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.ELECTRONIC,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildElectronicSmlCard */
/* ------------------------------------------ */
BuildElectronicSmlCard.Inherits(BuildElectronicCard);
function BuildElectronicSmlCard(id) {
	this.Inherits(BuildElectronicCard,id,400,1,[ {ht:[1,5], pro:300}, {ht:[6,7], pro:170},{ht:[8,10], pro:50} ], 0);
}

/* ------------------------------------------ */
/* class BuildElectronicLrgCard */
/* ------------------------------------------ */
BuildElectronicLrgCard.Inherits(BuildElectronicCard);
function BuildElectronicLrgCard(id) {
	this.Inherits(BuildElectronicCard,id,401,3,[ {ht:[1,3], pro:750}, {ht:[4,7], pro:40}, {ht:[8,10], pro:20} ], 0);
}
