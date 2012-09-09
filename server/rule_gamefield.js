var Defines = require("./rule_defines.js");
var Field = require('./rule_field.js');

function GameField(game) {
	this.fields = {};
	this.minX = 0;
	this.minY = 0;
	this.maxX = 8;
	this.maxY = 8;
	for(var x = this.minX ; x <= this.maxX ; x++) {
		for(var y = this.minY ; y <= this.maxY ; y++) {
			if(x%3!=1 || y%3!=1) {
				this.fields[x+":"+y] = this.createField(x,y,Defines.HouseType.SIMPLE_BUNGALOW,4,0);
			}
		}
	}
	this.freeRange = [];
	this.createFreeRange();
}

GameField.prototype.createFreeRange = function() {
	for(var x = this.minX-3 ; x <= this.maxX+3 ; x += 3) {
		this.freeRange.push([x,this.minY-3]);
		this.freeRange.push([x,this.maxY+1]);
	}	
	for(var y = this.minY ; y <= this.maxY ; y += 3) {
		this.freeRange.push([this.minX-3,y]);
		this.freeRange.push([this.maxX+1,y]);
	}		
}

GameField.prototype.createField = function(x,y,houseType,maxPop,localLevel) {
	var pop = parseInt(Math.random() * maxPop)+1;
	var newField = new Field(x,y, Defines.FieldType.HOUSE, { 
			houseType : houseType, 
			housePopulation : pop, 
			supply : [] }, localLevel);
	return newField;
}

GameField.forPlayer = function(player, fields) {
	var retObj = {};
	for(var k in fields )  {
		var v = fields[k];
		retObj[k] = Field.forPlayer(v, player);
	}
	return retObj;
}

GameField.prototype.forPlayer = function(player) {
	return GameField.forPlayer(player, this.fields);
}

GameField.prototype.add = function(width, height, houseType, maxPop, localLevel) {

	if(this.freeRange.length == 0 ) {
		this.minX -= 3;
		this.minY -= 3;
		this.maxX += 3;
		this.maxY += 3;
		this.createFreeRange();		
	}

	var ind = parseInt(Math.random() * this.freeRange.length);
	var ar = this.freeRange[ind];
	this.freeRange.splice(ind,1);

	var retObj = {};
	for(var x = ar[0] ; x < ar[0]+3 ; x++) {
		for(var y = ar[1] ; y < ar[1]+3 ; y++) {
			if(Math.abs((x+(x<0?+1:0))%3)!=1 || Math.abs((y+(y<0?+1:0))%3)!=1) {
				var newField = this.createField(x,y,houseType, maxPop, localLevel);
				this.fields[x+":"+y] = newField;
				retObj[x+":"+y] = newField;
			}
		}
	}
	return retObj;
}

GameField.reinit = function(body) {
	body.__proto__ = GameField.prototype;	
}

module.exports = GameField;