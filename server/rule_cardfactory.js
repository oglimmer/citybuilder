var Cards = require("./rule_card.js");

var CardFactory = {

	availCards0 : [
		[0,2],[1,2],[2,1],[3,2],[4,2],[5,2],[6,1],[7,1],[8,3],[9,3],[10,3],
		[100,2],[101,4],[102,4],[103,4],[104,1],[105,1],[106,2],
		[200,2],[201,2],[202,2],[203,2],[204,1],[205,1],[206,1],[207,2],[208,1],
		[300,6],[301,2],[302,1],
		[400,5],[401,3]
	],
	availCards1 : [
		[500,25],[501,15],[502,0],[503,0],[504,0],[505,25],
		[600,7],[601,7],[602,7],[603,5],[603,8],[604,5],[605,5],
		[700, 4],[701, 4],[702, 4],[703, 4],[704, 4],[705, 4]
	],
	classNames : {			
		id0: "BuildRestaurantItaSmCard",
		id1: "BuildRestaurantItaMidCard",
		id2: "BuildRestaurantItaPreCard",
		id3: "BuildRestaurantGreekMidCard",
		id4: "BuildRestaurantChinSmCard",
		id5: "BuildRestaurantChinLrgCard",
		id6: "BuildRestaurantSteakPreCard",
		id7: "BuildRestaurantFrePreCard",
		id8: "BuildRestaurantUSFF1Card",
		id9: "BuildRestaurantUSFF2Card",
		id10: "BuildRestaurantUSFF3Card",
		id100: "BuildGroceriesSmCard",
		id101: "BuildGroceriesDisc1Card",
		id102: "BuildGroceriesDisc2Card",
		id103: "BuildGroceriesDisc3Card",
		id104: "BuildGroceriesSuperMartCard",
		id105: "BuildGroceriesBioSmCard",
		id106: "BuildGroceriesBioLrgCard",
		id200: "BuildClothingUltraCheapCard",
		id201: "BuildClothingCheapCard",
		id202: "BuildClothingCheapLrgCard",
		id203: "BuildClothingCheapYoungCard",
		id204: "BuildClothingLux1Card",
		id205: "BuildClothingLux2Card",
		id206: "BuildClothingFatCard",
		id207: "BuildClothingRegLrgCard",
		id208: "BuildClothingTeenPreCard",
		id300: "BuildJeweleryCheapCard",
		id301: "BuildJeweleryMidCard",
		id302: "BuildJeweleryPreCard",
		id400: "BuildElectronicSmlCard",
		id401: "BuildElectronicLrgCard",
		id500: "GentrificationCard",
		id501: "MorePopulationCard",
		id502: "CityGrowsLowerMiddleclassCard",
		id503: "CityGrowsMiddleclassCard",
		id504: "CityGrowsUnderclassCard",
		id505: "NewPeopleCard",
		id600: "BuildLocalLevelPoliceCard",
		id601: "BuildLocalLevelHospitalCard",
		id602: "BuildLocalLevelFirestationCard",
		id603: "AddCriminals1Card",
		id604: "AddCriminals2Card",
		id605: "AddCriminals3Card",
		id700: "RemoveFoodCard",
		id701: "RemoveClothingCard",
		id702: "RemoveGroceriesCard",
		id703: "RemoveJeweleryCard",
		id705: "RemoveElectronicCard",
		id704: "RemoveLocalLevelCard"
	},
	createCard : function(id, no) {
		var className = this.classNames["id"+no];
		return new Cards[className](id);
	}
};


module.exports = CardFactory;