import { describe, it, expect } from 'vitest';
import Field from '../server/rule_field.js';
import { FieldType, HouseType, HouseTypeMaxPop } from '../server/rule_defines.js';

const Helper = {
	getPlayer() {
		return { no: 5 };
	}
};

describe('Field', () => {

	it('forPlayerMyOwnFieldBuilding', () => {
		const f = new Field(1, 1, FieldType.FOOD, { cardData: 'whatever' }, 100);
		f.buildState = 1;
		f.owner = 5;
		f.ownerName = 'foo';

		const sd = Field.forPlayer(f, Helper.getPlayer());

		expect(sd.attachedCard).not.toBeNull();
		expect(sd.type).toBe(FieldType.FOOD);
	});

	it('forPlayerOtherPlayersFieldBuilding', () => {
		const f = new Field(1, 1, FieldType.FOOD, { cardData: 'whatever' }, 100);
		f.buildState = 1;
		f.owner = 3;
		f.ownerName = 'foo';

		const sd = Field.forPlayer(f, Helper.getPlayer());

		expect(sd.attachedCard).toBeNull();
		expect(sd.type).toBe(FieldType.UNKNOWN);
	});

	it('forPlayerOtherPlayersFieldDone', () => {
		const f = new Field(1, 1, FieldType.FOOD, { cardData: 'whatever' }, 100);
		f.buildState = 2;
		f.owner = 3;
		f.ownerName = 'foo';

		const sd = Field.forPlayer(f, Helper.getPlayer());

		expect(sd.attachedCard).not.toBeNull();
		expect(sd.type).toBe(FieldType.FOOD);
	});

	it('forPlayerOtherPlayersFieldHouse', () => {
		const f = new Field(1, 1, FieldType.HOUSE, { houseType: HouseType.VILLA, housePopulation: 4, supply: [] }, 100);
		f.buildState = 0;

		const sd = Field.forPlayer(f, Helper.getPlayer());

		expect(sd.attachedCard).not.toBeNull();
		expect(sd.type).toBe(FieldType.HOUSE);
	});

	it('downgradeSucc', () => {
		const f = new Field(1, 1, FieldType.HOUSE, { houseType: HouseType.VILLA, housePopulation: 4, supply: [] }, 100);
		Field.socialChange(f);
		expect(f.attachedCard.houseType).not.toBe(HouseType.VILLA);
	});

	it('downgradeNo', () => {
		const f = new Field(1, 1, FieldType.HOUSE, { houseType: HouseType.VILLA, housePopulation: 4, supply: [] }, 305);
		Field.socialChange(f);
		expect(f.attachedCard.houseType).toBe(HouseType.VILLA);
	});
});
