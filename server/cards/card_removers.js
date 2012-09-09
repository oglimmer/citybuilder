var FieldType = require("../rule_defines.js").FieldType;
var HouseType = require("../rule_defines.js").HouseType;
var basecards = require('./card_basecards.js');
var log4js = require('log4js');
var logger = log4js.getLogger('game');


var RentalCard = basecards.RentalCard;

/* ------------------------------------------ */
/* class RemoveBuildingCard */
/* No: 700...799 */
/* ------------------------------------------ */
RemoveBuildingCard.Inherits(RentalCard);
function RemoveBuildingCard(id,no,removableType) {
	this.Inherits(RentalCard,id,no,0,FieldType.HOUSE);
	this.removableType = removableType;
}
RemoveBuildingCard.prototype.prePlay = function() {
	return {
		selectable : 'ALL_OCCUPIED_BY_' + this.removableType,
		range : this.range
		//buildspace : '1x1'		
	};
};
RemoveBuildingCard.prototype.play = function(field, player) {
	if(field.type !== FieldType.HOUSE) {
		field.type = this.type;
		field.owner = null;
		field.ownerName = null;
		field.attachedCard = { 
			houseType : HouseType.SIMPLE_BUNGALOW, 
			housePopulation : Math.floor(Math.random()*4)+1, 
			supply : [] };
		field.buildState = 1;
		return { changedFields: {}, secretPlay : true };
	} else {
		throw "error_field_is_not_occupied";
	}
};

/* ------------------------------------------ */
/* class RemoveFoodCard */
/* ------------------------------------------ */
RemoveFoodCard.Inherits(RemoveBuildingCard);
function RemoveFoodCard(id) {
	this.Inherits(RemoveBuildingCard,id,700, FieldType.FOOD);
}

/* ------------------------------------------ */
/* class RemoveClothingCard */
/* ------------------------------------------ */
RemoveClothingCard.Inherits(RemoveBuildingCard);
function RemoveClothingCard(id) {
	this.Inherits(RemoveBuildingCard,id,701, FieldType.CLOTHING);
}

/* ------------------------------------------ */
/* class RemoveGroceriesCard */
/* ------------------------------------------ */
RemoveGroceriesCard.Inherits(RemoveBuildingCard);
function RemoveGroceriesCard(id) {
	this.Inherits(RemoveBuildingCard,id,702, FieldType.GROCERIES);
}

/* ------------------------------------------ */
/* class RemoveJeweleryCard */
/* ------------------------------------------ */
RemoveJeweleryCard.Inherits(RemoveBuildingCard);
function RemoveJeweleryCard(id) {
	this.Inherits(RemoveBuildingCard,id,703, FieldType.JEWELERY);
}

/* ------------------------------------------ */
/* class RemoveElectronicCard */
/* ------------------------------------------ */
RemoveElectronicCard.Inherits(RemoveBuildingCard);
function RemoveElectronicCard(id) {
	this.Inherits(RemoveBuildingCard,id,704, FieldType.ELECTRONIC);
}

/* ------------------------------------------ */
/* class RemoveLocalLevelCard */
/* ------------------------------------------ */
RemoveLocalLevelCard.Inherits(RemoveBuildingCard);
function RemoveLocalLevelCard(id) {
	this.Inherits(RemoveBuildingCard,id,705, FieldType.LOCALLEVEL);
}
