var FieldType = require("./rule_defines.js").FieldType;
var LocalLevel = require("./rule_defines.js").LocalLevel;
var HouseType = require("./rule_defines.js").HouseType;
var HouseTypeMaxPop = require("./rule_defines.js").HouseTypeMaxPop;
var log4js = require('log4js');
var logger = log4js.getLogger('game');


function Field(x,y,type,houseCard,localLevel) {
	this.x = x; // 0..n logical x coordiate on field 
	this.y = y; // 0..n logical y coordiate on field 
	this.type = type; // field type HOUSE, FOOD 
	this.owner = null; // player.no
	this.ownerName = null; // player.playerName
	this.attachedCard = houseCard; // a card doc which was played on this field
	this.buildState = 0; // 0:nothing build, 1:build in progress, 2: done
	this.localLevel = localLevel; // base for lower-class
	this.baseLocalLevel = this.localLevel;
}

/* Field must not have methods on its objects, since we don't reinit after loading */

Field.cor = function(field) {
	return field.x+":"+field.y;
}

Field.asFields = function(field) {
	var fields = {};
	fields[Field.cor(field)] = field;
	return fields;
}

Field.forPlayer = function(field, player) {
	if(field.owner == player.no || field.buildState != 1) {
		return field;
	} else {
		var obj = JSON.parse(JSON.stringify(field));
		obj.attachedCard = null;
		obj.type = FieldType.UNKNOWN;
		return obj;
	}	
}

Field.socialChange = function(field) {
	var oldHouseType = field.attachedCard.houseType;	
	[LocalLevel.UNDERCLASS, LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach(function(locLev) {		
		if(field.localLevel >= locLev.min && field.localLevel <= locLev.max) {			
			if(field.attachedCard.houseType != HouseType[locLev.buildings[0]]) {
				var rnd = parseInt(Math.random() * locLev.buildings.length);
				field.attachedCard.houseType = HouseType[locLev.buildings[rnd]];
				field.attachedCard.housePopulation = parseInt(Math.random() * HouseTypeMaxPop[locLev.buildings[rnd]])+1
			}
		}
	});	
	if(oldHouseType != field.attachedCard.houseType) {
		logger.debug("[Field.socialChange] Changed houseType for " + field.x+","+field.y+" from "+oldHouseType+" to "+field.attachedCard.houseType);
	}
}


module.exports = Field;