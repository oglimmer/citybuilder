/* ------------------------------------------ */
/* class UIServices */
/* ------------------------------------------ */
function UIServices() {}
UIServices.getUiSwitchButtonText = function(uiMode) {
	return G.i18n.uiSwitchButtonText_mode[uiMode];
}
UIServices.getBuildStateText = function(buildState) {
	return G.i18n.buildStateText[buildState];
}
UIServices.getLocalLevelTextShort = function(localLevel) {
	if(localLevel < 0) {
		return G.i18n.localLevelTextShort_0;
	} else if(localLevel < 30) {
		return G.i18n.localLevelTextShort_1;
	} else if(localLevel < 100) {
		return G.i18n.localLevelTextShort_2;
	} else if(localLevel < 300) {
		return G.i18n.localLevelTextShort_3;
	}
	return G.i18n.localLevelTextShort_4;
}
UIServices.getLocalLevelText = function(localLevel) {
	if(localLevel < 0) {
		return G.i18n.localLevelText_0;
	} else if(localLevel < 30) {
		return G.i18n.localLevelText_1;
	} else if(localLevel < 100) {
		return G.i18n.localLevelText_2;
	} else if(localLevel < 300) {
		return G.i18n.localLevelText_3;
	}
	return G.i18n.localLevelText_4;
}
UIServices.getHouseTypeText = function(houseType) {
	return G.i18n.houseTypeText[houseType];
}
UIServices.getHouseTypeTextShort = function(houseType) {
	return G.i18n.houseTypeTextShort[houseType];
}
UIServices.getMaxPop = function(houseType) {
	var maxPop;
	switch(houseType) {
		case 1:/*HouseType.VILLA*/
			maxPop = 4;
			break;
		case 2:/*HouseType.LARGE_HOUSE*/
			maxPop = 8;
			break;
		case 3:/*HouseType.TWO_FAM_HOUSE*/
			maxPop = 8;
			break;
		case 4:/*HouseType.ROW_HOUSE*/
			maxPop = 16;
			break;
		case 5:/*HouseType.APARTMENT_BUILDING*/
			maxPop = 30;
			break;
		case 6:/*HouseType.SIMPLE_BUNGALOW*/
			maxPop = 4;
			break;
		case 7:/*HouseType.SMALL_APARTMENT_TOWER*/
			maxPop = 60;
			break;
		case 8:/*HouseType.LARGE_APARTMENT_TOWER*/
			maxPop = 240;
			break;
		case 9:/*HouseType.CHARITY_BUILDING*/
			maxPop = 60;
			break;
		case 10:/*HouseType.GHETTO_TOWER*/
			maxPop = 240;
			break;
	}	
	return maxPop;
}
UIServices.addCommas = function(numberString) {
  numberString += '';
  var x = numberString.split('.'),
      x1 = x[0],
      x2 = x.length > 1 ? '.' + x[1] : '',
      rgxp = /(\d+)(\d{3})/;
  while (rgxp.test(x1)) {
    x1 = x1.replace(rgxp, '$1' + ',' + '$2');
  }
  return x1 + x2;
}