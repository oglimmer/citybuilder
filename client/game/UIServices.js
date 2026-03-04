import { G, LOCALLEVEL_MIN_UPPER, LOCALLEVEL_MIN_UPPERMIDDLE, LOCALLEVEL_MIN_MIDDLE, LOCALLEVEL_MIN_LOWERMIDDLE } from './state.js';

export default class UIServices {
	static getUiSwitchButtonText(uiMode) {
		return G.i18n.uiSwitchButtonText_mode[uiMode];
	}

	static getBuildStateText(buildState) {
		return G.i18n.buildStateText[buildState];
	}

	static getLocalLevelTextShort(localLevel) {
		if (localLevel < LOCALLEVEL_MIN_LOWERMIDDLE) {
			return G.i18n.localLevelTextShort_0;
		} else if (localLevel < LOCALLEVEL_MIN_MIDDLE) {
			return G.i18n.localLevelTextShort_1;
		} else if (localLevel < LOCALLEVEL_MIN_UPPERMIDDLE) {
			return G.i18n.localLevelTextShort_2;
		} else if (localLevel < LOCALLEVEL_MIN_UPPER) {
			return G.i18n.localLevelTextShort_3;
		}
		return G.i18n.localLevelTextShort_4;
	}

	static getLocalLevelText(localLevel) {
		if (localLevel < LOCALLEVEL_MIN_LOWERMIDDLE) {
			return G.i18n.localLevelText_0;
		} else if (localLevel < LOCALLEVEL_MIN_MIDDLE) {
			return G.i18n.localLevelText_1;
		} else if (localLevel < LOCALLEVEL_MIN_UPPERMIDDLE) {
			return G.i18n.localLevelText_2;
		} else if (localLevel < LOCALLEVEL_MIN_UPPER) {
			return G.i18n.localLevelText_3;
		}
		return G.i18n.localLevelText_4;
	}

	static getHouseTypeText(houseType) {
		return G.i18n.houseTypeText[houseType];
	}

	static getHouseTypeTextShort(houseType) {
		return G.i18n.houseTypeTextShort[houseType];
	}

	static getFieldType(type) {
		return G.i18n.fieldType[type + 1];
	}

	static getFieldTypeLong(type) {
		return G.i18n.fieldTypeLong[type + 1];
	}

	static getMaxPop(houseType) {
		let maxPop;
		switch (houseType) {
			case 1: maxPop = 4; break;
			case 2: maxPop = 8; break;
			case 3: maxPop = 8; break;
			case 4: maxPop = 16; break;
			case 5: maxPop = 30; break;
			case 6: maxPop = 4; break;
			case 7: maxPop = 60; break;
			case 8: maxPop = 240; break;
			case 9: maxPop = 60; break;
			case 10: maxPop = 240; break;
		}
		return maxPop;
	}

	static addCommas(numberString) {
		numberString += '';
		const x = numberString.split('.');
		let x1 = x[0];
		const x2 = x.length > 1 ? `.${x[1]}` : '';
		const rgxp = /(\d+)(\d{3})/;
		while (rgxp.test(x1)) {
			x1 = x1.replace(rgxp, '$1,$2');
		}
		return x1 + x2;
	}
}
