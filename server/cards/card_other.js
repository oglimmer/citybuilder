var FieldType = require("../rule_defines.js").FieldType;
var HouseType = require("../rule_defines.js").HouseType;
var HouseTypeMaxPop = require("../rule_defines.js").HouseTypeMaxPop;
var HouseTypeReverse = require("../rule_defines.js").HouseTypeReverse;
var LocalLevel = require("../rule_defines.js").LocalLevel;
var basecards = require('./card_basecards.js');
var log4js = require('log4js');
var logger = log4js.getLogger('game');

var Card = basecards.Card;

// ID:s 500...599

/* ------------------------------------------ */
/* class GentrificationCard */
/* ------------------------------------------ */
GentrificationCard.Inherits(Card);
function GentrificationCard(id) {
	this.Inherits(Card,id,500);
	this.playType = 1;
}
GentrificationCard.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED',
		range : 1
		//buildspace : '1x1'
	};
};
GentrificationCard.gentrificate = function(field, changedFields) {
	if(field.type == FieldType.HOUSE) {
		var oldHouseType = field.attachedCard.houseType;
		[LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach(function(locLev) {				
			if(field.localLevel >= locLev.min && field.localLevel <= locLev.max) {			
				if(field.attachedCard.houseType > HouseType[locLev.buildings[ locLev.buildings.length-1 ]]) {
					var rnd = parseInt(Math.random() * locLev.buildings.length);
					field.attachedCard.houseType = HouseType[locLev.buildings[rnd]];
					field.attachedCard.housePopulation = parseInt(Math.random() * HouseTypeMaxPop[locLev.buildings[rnd]])+1
				}
			}
		});	
		if(oldHouseType != field.attachedCard.houseType) {
			changedFields[field.x+":"+field.y] = field;
			logger.debug("[GentrificationCard] Changed houseType for " + field.x+","+field.y+" from "+oldHouseType+" to "+field.attachedCard.houseType);
		}	
	}	
}
GentrificationCard.prototype.play = function(field, player, fields) {
	var changedFields = {};
	GentrificationCard.gentrificate(field, changedFields);
	Card.forEachField(1, field, fields, function(surroundingElement) {
		GentrificationCard.gentrificate(surroundingElement, changedFields);
	});
	return { changedFields : changedFields, secretPlay : false };
};

/* ------------------------------------------ */
/* class MorePopulationCard */
/* ------------------------------------------ */
MorePopulationCard.Inherits(Card);
function MorePopulationCard(id) {
	this.Inherits(Card,id,501);
	this.playType = 1;
}
MorePopulationCard.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED',
		range : 2
		//buildspace : '1x1'		
	};
};
MorePopulationCard.getMaxPop = function(houseType) {
	return HouseTypeMaxPop[HouseTypeReverse[houseType]];
}
MorePopulationCard.populate = function(field,changedFields) {
	if(field.type == FieldType.HOUSE) {
		var oldPop = field.attachedCard.housePopulation;
		var maxPop = MorePopulationCard.getMaxPop(field.attachedCard.houseType);
		var rand = parseInt(Math.random() * (maxPop-field.attachedCard.housePopulation))+1;
		field.attachedCard.housePopulation += rand;
		field.attachedCard.housePopulation = Math.min(maxPop, field.attachedCard.housePopulation);
		if(oldPop != field.attachedCard.housePopulation) {
			logger.debug("[MorePopulationCard] Field "+field.x+","+field.y+" gained "+rand+" to now "+field.attachedCard.housePopulation);	
			changedFields[field.x+":"+field.y] = field;
		}
	}
}
MorePopulationCard.prototype.play = function(field, player, fields) {
	var changedFields = {};
	MorePopulationCard.populate(field, changedFields);
	Card.forEachField(1, field, fields, function(surroundingElement) {
		MorePopulationCard.populate(surroundingElement, changedFields);
	});
	return { changedFields : changedFields, secretPlay : false };
}

/* ------------------------------------------ */
/* class CityGrowsCard */
/* ------------------------------------------ */
CityGrowsCard.Inherits(Card);
function CityGrowsCard(id,no,houseType,baseLocalLevel) {
	this.Inherits(Card,id,no);
	this.houseType = houseType;
	this.baseLocalLevel = baseLocalLevel;
}
CityGrowsCard.prototype.playDirect = function(player, onSuccess) {	
	var GameManager = require("../rule_gamemanager.js");
	var PlayerManager = require("../rule_playermanager.js");	
	GameManager.getGame(player.gameId, function(game) {
		var newFieldList;
		GameManager.storeGame(game,function(gameToPrepare) {
			newFieldList = gameToPrepare.gameField.add(3,3,this.houseType,MorePopulationCard.getMaxPop(this.houseType),this.baseLocalLevel);
		}.bind(this),function(savedGame) {
			PlayerManager.storePlayer(player, function(player) {
				player.cardHand.removeCardById(this.id);
			}.bind(this),function() {
				onSuccess(newFieldList);
			});
		}.bind(this));
	}.bind(this));
};

/* ------------------------------------------ */
/* class CityGrowsLowerMiddleclassCard */
/* ------------------------------------------ */
CityGrowsLowerMiddleclassCard.Inherits(CityGrowsCard);
function CityGrowsLowerMiddleclassCard(id) {
	this.Inherits(CityGrowsCard,id,502,HouseType.SIMPLE_BUNGALOW,0);
}

/* ------------------------------------------ */
/* class CityGrowsMiddleclassCard */
/* ------------------------------------------ */
CityGrowsMiddleclassCard.Inherits(CityGrowsCard);
function CityGrowsMiddleclassCard(id) {
	this.Inherits(CityGrowsCard,id,503,HouseType.TWO_FAM_HOUSE,30);
}

/* ------------------------------------------ */
/* class CityGrowsUnderclassCard */
/* ------------------------------------------ */
CityGrowsUnderclassCard.Inherits(CityGrowsCard);
function CityGrowsUnderclassCard(id) {
	this.Inherits(CityGrowsCard,id,504,HouseType.CHARITY_BUILDING,-10);
}

/* ------------------------------------------ */
/* class NewPeopleCard */
/* ------------------------------------------ */
NewPeopleCard.Inherits(Card);
function NewPeopleCard(id) {
	this.Inherits(Card,id,505);
	this.playType = 1;
}
NewPeopleCard.prototype.prePlay = function() {
	return {
		selectable : 'ALL_UNOCCUPIED',
		range : 1
		//buildspace : '1x1'		
	};
};
NewPeopleCard.newPeople = function(field,changedFields) {
	if(field.type == FieldType.HOUSE) {
		var oldHouseType = field.attachedCard.houseType;		
		var currentHouseTypeName = HouseTypeReverse[oldHouseType];
		var currentLocalLevel = null;
		[LocalLevel.UNDERCLASS, LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach(function(locLev) {				
			locLev.buildings.forEach(function(buildName) {
				if(buildName == currentHouseTypeName) {
					currentLocalLevel = locLev;
				}
			})
		});
		if(currentLocalLevel==null) {
			logger.error("[newPeople] currentLocalLevel was null, %j",field);
			return;
		}
		var rnd = parseInt(Math.random() * currentLocalLevel.buildings.length);
		var newHouseType = HouseType[currentLocalLevel.buildings[rnd]];
		var newHousePopulation = parseInt(Math.random() * HouseTypeMaxPop[currentLocalLevel.buildings[rnd]])+1
		if((newHouseType < field.attachedCard.houseType && newHouseType != HouseType.SIMPLE_BUNGALOW) || newHousePopulation > field.attachedCard.housePopulation) {
			field.attachedCard.houseType = newHouseType;
			field.attachedCard.housePopulation = newHousePopulation;
			changedFields[field.x+":"+field.y] = field;
			logger.debug("[NewPeopleCard] Changed houseType for " + field.x+","+field.y+" from "+oldHouseType+" to "+field.attachedCard.houseType);
		}		
	}
}
NewPeopleCard.prototype.play = function(field, player, fields) {
	var changedFields = {};
	NewPeopleCard.newPeople(field, changedFields);
	Card.forEachField(1, field, fields, function(surroundingElement) {
		NewPeopleCard.newPeople(surroundingElement, changedFields);
	});
	return { changedFields : changedFields, secretPlay : false };
}

