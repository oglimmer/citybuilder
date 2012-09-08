var Field = require('../server/rule_field.js');
var FieldType = require("../server/rule_defines.js").FieldType;
var LocalLevel = require("../server/rule_defines.js").LocalLevel;
var HouseType = require("../server/rule_defines.js").HouseType;
var HouseTypeMaxPop = require("../server/rule_defines.js").HouseTypeMaxPop;


var Helper = {
	
	getPlayer : function() {
		var player = {
			no : 5
		}
		return player;
	}
}


module.exports = {

	forPlayerMyOwnFieldBuilding : function(test) {

		var f = new Field(1,1,FieldType.FOOD,{ cardData : 'whatever' },100);
		f.buildState = 1;
		f.owner = 5;
		f.ownerName = 'foo';

		var sd = Field.forPlayer(f, Helper.getPlayer());

		test.ok(sd.attachedCard !== null);
		test.ok(sd.type === FieldType.FOOD);

		test.done();
	},
	forPlayerOtherPlayersFieldBuilding : function(test) {

		var f = new Field(1,1,FieldType.FOOD,{ cardData : 'whatever' },100);
		f.buildState = 1;
		f.owner = 3;
		f.ownerName = 'foo';

		var player = {
			no : 5
		}

		var sd = Field.forPlayer(f, Helper.getPlayer());

		test.ok(sd.attachedCard === null);
		test.ok(sd.type === FieldType.UNKNOWN);

		test.done();
	},
	forPlayerOtherPlayersFieldDone : function(test) {

		var f = new Field(1,1,FieldType.FOOD,{ cardData : 'whatever' },100);
		f.buildState = 2;
		f.owner = 3;
		f.ownerName = 'foo';

		var sd = Field.forPlayer(f, Helper.getPlayer());

		test.ok(sd.attachedCard !== null);
		test.ok(sd.type === FieldType.FOOD);

		test.done();
	},
	forPlayerOtherPlayersFieldHouse : function(test) {

		var f = new Field(1,1,FieldType.HOUSE,{ houseType : HouseType.VILLA, housePopulation: 4, supply: []},100);
		f.buildState = 0;

		var sd = Field.forPlayer(f, Helper.getPlayer());

		test.ok(sd.attachedCard !== null);
		test.ok(sd.type === FieldType.HOUSE);

		test.done();
	},


	downgradeSucc : function(test) {
		var f = new Field(1,1,FieldType.HOUSE,{ houseType : HouseType.VILLA, housePopulation: 4, supply: []},100);
		Field.downgrade(f);
		test.ok(f.attachedCard.houseType !== HouseType.VILLA);
		test.done();
	},
	downgradeNo : function(test) {
		var f = new Field(1,1,FieldType.HOUSE,{ houseType : HouseType.VILLA, housePopulation: 4, supply: []},305);
		Field.downgrade(f);
		test.ok(f.attachedCard.houseType === HouseType.VILLA);
		test.done();
	}



}