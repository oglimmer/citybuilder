import * as Defines from './rule_defines.js';
import Field from './rule_field.js';

export default class GameField {
	constructor() {
		this.fields = {};
		this.minX = 0;
		this.minY = 0;
		this.maxX = 8;
		this.maxY = 8;
		for (let x = this.minX; x <= this.maxX; x++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				if (x % 3 != 1 || y % 3 != 1) {
					this.fields[`${x}:${y}`] = this.createField(x, y, Defines.HouseType.SIMPLE_BUNGALOW, 4, 0);
				}
			}
		}
		this.freeRange = [];
		this.createFreeRange();
	}

	createFreeRange() {
		for (let x = this.minX - 3; x <= this.maxX + 3; x += 3) {
			this.freeRange.push([x, this.minY - 3]);
			this.freeRange.push([x, this.maxY + 1]);
		}
		for (let y = this.minY; y <= this.maxY; y += 3) {
			this.freeRange.push([this.minX - 3, y]);
			this.freeRange.push([this.maxX + 1, y]);
		}
	}

	createField(x, y, houseType, maxPop, localLevel) {
		const pop = parseInt(Math.random() * maxPop) + 1;
		return new Field(x, y, Defines.FieldType.HOUSE, {
			houseType,
			housePopulation: pop,
			supply: []
		}, localLevel);
	}

	static forPlayer(player, fields) {
		const retObj = {};
		for (const k in fields) {
			const v = fields[k];
			retObj[k] = Field.forPlayer(v, player);
		}
		return retObj;
	}

	forPlayer(player) {
		return GameField.forPlayer(player, this.fields);
	}

	add(width, height, houseType, maxPop, localLevel) {
		if (this.freeRange.length == 0) {
			this.minX -= 3;
			this.minY -= 3;
			this.maxX += 3;
			this.maxY += 3;
			this.createFreeRange();
		}

		const ind = parseInt(Math.random() * this.freeRange.length);
		const ar = this.freeRange[ind];
		this.freeRange.splice(ind, 1);

		const retObj = {};
		for (let x = ar[0]; x < ar[0] + 3; x++) {
			for (let y = ar[1]; y < ar[1] + 3; y++) {
				if (Math.abs((x + (x < 0 ? +1 : 0)) % 3) != 1 || Math.abs((y + (y < 0 ? +1 : 0)) % 3) != 1) {
					const newField = this.createField(x, y, houseType, maxPop, localLevel);
					this.fields[`${x}:${y}`] = newField;
					retObj[`${x}:${y}`] = newField;
				}
			}
		}
		return retObj;
	}

	static reinit(body) {
		Object.setPrototypeOf(body, GameField.prototype);
	}
}
