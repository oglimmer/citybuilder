export let socket = null;
export let G = null;
export let GL = null;

export function setSocket(s) { socket = s; }
export function setG(g) { G = g; }
export function setGL(gl) { GL = gl; }

export const NUMBER_OF_FIELD_TYPES = 7;
export const NUMBER_OF_NON_FIELD_TYPE_MODES = 2;

export const LOCALLEVEL_MIN_UPPER = 250;
export const LOCALLEVEL_MIN_UPPERMIDDLE = 100;
export const LOCALLEVEL_MIN_MIDDLE = 30;
export const LOCALLEVEL_MIN_LOWERMIDDLE = 0;

export const THEME = {
	bg: '#1a1a2e',
	panelBg: '#16213e',
	panelBorder: '#2a2a4a',
	textPrimary: '#e0e0e0',
	textSecondary: '#a0a0b8',
	textDim: '#6a6a80',
	accent: '#4fc3f7',
	accentDark: '#0288d1',

	// Info bar
	infoBarBg: '#0f1a2e',
	infoBarBgEnd: '#162040',
	infoBarText: '#e0e0e0',

	// Buttons
	btnBg: '#2a3a5c',
	btnBgEnd: '#1e2d4a',
	btnHover: '#3a4f7a',
	btnHoverEnd: '#2a3d60',
	btnClicked: '#4fc3f7',
	btnClickedEnd: '#0288d1',
	btnText: '#e0e0e0',
	btnDisabledText: '#5a5a70',
	btnBorder: '#3a4a6a',
	btnRadius: 6,

	// Cards
	cardBg: '#1e2a45',
	cardBorder: '#3a4a6a',
	cardTitleBg: '#2a3860',
	cardTitleBgEnd: '#1e2a45',
	cardText: '#e0e0e0',
	cardSelected: '#4fc3f7',
	cardRemoved: 'rgba(180, 40, 40, 0.6)',

	// Board cells
	cellBorder: '#2a2a4a',
	cellText: '#ffffff',
	cellOwnerColors: ['#4fc3f7', '#f48fb1', '#81c784', '#ffb74d', '#ce93d8', '#a1887f'],
	cellTypes: {
		'-1': '#222238',
		0: '#2e2e42',
		1: '#2e7d32',
		2: '#00897b',
		3: '#558b2f',
		4: '#43a047',
		5: '#1565c0',
		6: '#5c6bc0',
		7: '#8e24aa',
	},
	cellHouseUi0: ['#1a1a2e', '#252538', '#353550', '#505068', '#707088', '#909098'],
	cellPopUi2: ['#1a1a2e', '#404058', '#808098'],
	cellInfluenceUi4: ['#1a1a2e', '#90b0d0', '#404060', '#707098'],

	// Highlights
	highlightTarget: '#ffd54f',
	highlightRange: '#c62828',
	highlightRangeDim: '#4a1a1a',
	infoFieldSelected: '#1a5a8a',
	infoFieldRange: '#4a1a1a',

	// Info field
	infoFieldBg: 'rgba(22, 33, 62, 0.95)',
	infoFieldBorder: '#3a4a6a',
	infoFieldText: '#e0e0e0',
	infoFieldHeader: '#4fc3f7',

	// Auction
	auctionText: '#e0e0e0',

	// Fonts
	fontFamily: "'Inter', sans-serif",
	fontSize: '12px',
};
