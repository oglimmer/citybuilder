Array.prototype.removeByObj = function(obj) {
	for(var i = 0 ; i < this.length ; i++) {
		if(this[i] === obj) {
			this.splice(i,1);
			return;
		}
	}
	console.trace("[removeByObj] failed for " + obj);
};
Array.prototype.findByProp = function(propName, propValue) {
	for(var i = 0 ; i < this.length ; i++) {
		if(this[i][propName] === propValue) {
			return this[i];
		}
	}
};
Array.prototype.in = function(elementToFind) {
	for(var i = 0 ; i < this.length ; i++) {
		if(this[i] === elementToFind) {
			return true;
		}
	}
	return false;
};

var Config = {
	dbHost : 'http://localhost:5984',
	db : 'http://localhost:5984/citybuilder',
	dbSchema : 'citybuilder',
	httpPort : 1337
}

var FieldType = {
	UNKNOWN : -1,
	HOUSE : 0,
	FOOD : 1,
	GROCERIES : 2,
	CLOTHING : 3,
	JEWELERY : 4,
	ELECTRONIC : 5,
	LOCALLEVEL : 6,
	CRIMINAL : 7
}

var HouseType = {
	GHETTO_TOWER : 10,
	CHARITY_BUILDING : 9,
	LARGE_APARTMENT_TOWER : 8,
	SMALL_APARTMENT_TOWER : 7,
	SIMPLE_BUNGALOW : 6,
	APARTMENT_BUILDING : 5,
	ROW_HOUSE : 4,
	TWO_FAM_HOUSE : 3,
	LARGE_HOUSE : 2,
	VILLA : 1
}

var HouseTypeReverse = {
	"10": "GHETTO_TOWER" ,
	"9": "CHARITY_BUILDING",
	"8": "LARGE_APARTMENT_TOWER",
	"7": "SMALL_APARTMENT_TOWER",
	"6": "SIMPLE_BUNGALOW",
	"5": "APARTMENT_BUILDING",
	"4": "ROW_HOUSE",
	"3": "TWO_FAM_HOUSE",
	"2": "LARGE_HOUSE",
	"1": "VILLA" 
}

var HouseTypeMaxPop = {
	GHETTO_TOWER : 240,
	CHARITY_BUILDING : 60,
	LARGE_APARTMENT_TOWER : 240,
	SMALL_APARTMENT_TOWER : 60,
	SIMPLE_BUNGALOW : 4,
	APARTMENT_BUILDING : 32,
	ROW_HOUSE : 16,
	TWO_FAM_HOUSE : 8,
	LARGE_HOUSE : 8,
	VILLA : 4
}

var LocalLevel = {
	UNDERCLASS: {min:-99999, max:-1,buildings:["CHARITY_BUILDING","GHETTO_TOWER"]},
	LOWER_MIDDLE: {min:0, max:29,buildings:["SIMPLE_BUNGALOW","SMALL_APARTMENT_TOWER","LARGE_APARTMENT_TOWER"]},
	MIDDLE: {min:30, max:99,buildings:["TWO_FAM_HOUSE","ROW_HOUSE","APARTMENT_BUILDING"]},
	UPPER_MIDDLE: {min:100, max:299,buildings:["LARGE_HOUSE"]},
	UPPERCLASS: {min:250, max:99999,buildings:["VILLA"]}
}

var GameStates = {
	WAITING_FOR_PLAYERS : 0,
	CITY_VIEW : 1,
	SET_BIDDING : 2,
	PICK_CARD : 3,
	PICK_INITIAL_CARD : 4
}

module.exports.FieldType = FieldType;
module.exports.HouseType = HouseType;
module.exports.HouseTypeReverse = HouseTypeReverse;
module.exports.HouseTypeMaxPop = HouseTypeMaxPop;
module.exports.LocalLevel = LocalLevel;
module.exports.Config = Config;
module.exports.GameStates = GameStates;