import { FieldType, LocalLevel, HouseType, HouseTypeMaxPop, HouseTypeReverse } from './rule_defines.js';
import log4js from 'log4js';

const logger = log4js.getLogger('game');

export default class Field {
	constructor(x, y, type, houseCard, localLevel) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.owner = null;
		this.ownerName = null;
		this.attachedCard = houseCard;
		this.buildState = 0;
		this.localLevel = localLevel;
		this.baseLocalLevel = this.localLevel;
	}

	/* Field must not have methods on its objects, since we don't reinit after loading */

	static cor(field) {
		return `${field.x}:${field.y}`;
	}

	static asFields(field) {
		const fields = {};
		fields[Field.cor(field)] = field;
		return fields;
	}

	static forPlayer(field, player) {
		if (field.owner == player.no || field.buildState != 1) {
			return field;
		} else {
			const obj = JSON.parse(JSON.stringify(field));
			obj.attachedCard = null;
			obj.type = FieldType.UNKNOWN;
			return obj;
		}
	}

	static socialChange(field) {
		const oldHouseType = field.attachedCard.houseType;
		[LocalLevel.UNDERCLASS, LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach((locLev) => {
			if (field.localLevel >= locLev.min && field.localLevel <= locLev.max) {
				if (!locLev.buildings.includes(HouseTypeReverse[field.attachedCard.houseType])) {
					const rnd = parseInt(Math.random() * locLev.buildings.length);
					field.attachedCard.houseType = HouseType[locLev.buildings[rnd]];
					field.attachedCard.housePopulation = parseInt(Math.random() * HouseTypeMaxPop[locLev.buildings[rnd]]) + 1;
				}
			}
		});
		if (oldHouseType != field.attachedCard.houseType) {
			logger.debug(`[Field.socialChange] Changed houseType for ${field.x},${field.y} from ${oldHouseType} to ${field.attachedCard.houseType}`);
		}
	}
}
