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
function BuildLocalLevelCard(id,no,range,profitConfig,localLevelMod) {
	this.Inherits(RentalCard,id,no,range,FieldType.LOCALLEVEL,profitConfig,localLevelMod);
}

/* ------------------------------------------ */
/* class BuildLocalLevelPoliceCard */
/* ------------------------------------------ */
BuildLocalLevelPoliceCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelPoliceCard(id) {
	this.Inherits(BuildLocalLevelCard,id,600,1,[], 150);
}

/* ------------------------------------------ */
/* class BuildLocalLevelHospitalCard */
/* ------------------------------------------ */
BuildLocalLevelHospitalCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelHospitalCard(id) {
	this.Inherits(BuildLocalLevelCard,id,601,2,[], 70);
}

/* ------------------------------------------ */
/* class BuildLocalLevelFirestationCard */
/* ------------------------------------------ */
BuildLocalLevelFirestationCard.Inherits(BuildLocalLevelCard);
function BuildLocalLevelFirestationCard(id) {
	this.Inherits(BuildLocalLevelCard,id,602,3,[], 30);
}
