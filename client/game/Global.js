import { G, NUMBER_OF_FIELD_TYPES, NUMBER_OF_NON_FIELD_TYPE_MODES, THEME } from './state.js';
import Cookie from './Cookie.js';
import I18n from './I18n.js';
import ServerCommListener from './ServerCommListener.js';
import FieldPane from './FieldPane.js';
import Button from './Button.js';
import InfoField from './InfoField.js';
import CardLayouter from './CardLayouter.js';
import InfoBar from './InfoBar.js';
import AuctionPanel from './AuctionPanel.js';
import { CanvasManager, CanvasManagerUIMode } from './CanvasManager.js';

export default class Global {
	constructor() {
		this.canvas = document.getElementById('gameCanvas');
		this.ctx = this.canvas.getContext('2d');
		this.uiMode = 0;
		this.playerId = null;
		this.playerNo = null;
		this.gameState = 0;

		this.i18n = I18n[Cookie.get('lang')];
		this.serverCommListener = new ServerCommListener();
		this.fieldPane = new FieldPane();
		this.turnDoneButton = new Button(this.i18n.button_endRound, () => this.ctx.canvas.width - 80, () => this.ctx.canvas.height - 30, 75, () => this.serverCommListener.onTurnDone());
		this.infoField = new InfoField(this.ctx);
		this.cardLayouter = new CardLayouter(this.ctx);
		this.infoBar = new InfoBar();
		this.auctionPanel = new AuctionPanel();
		this.availableActions = 0;
		this.allPlayersData = [];
		this.incomeReceipt = [];
		this.lastBids = [];

		this.fieldPane.relocateX = 250;
		this.fieldPane.relocateY = 125;

		this.canvasManagerField = new CanvasManager();
		this.canvasManagerField.add(0, this.fieldPane);

		this.canvasManagerUiMode = new CanvasManagerUIMode();
		for (let i = 0; i < NUMBER_OF_NON_FIELD_TYPE_MODES + NUMBER_OF_FIELD_TYPES; i++) {
			const uiMode = i;
			const uiButton = new Button(this.i18n.uiSwitchButtonText_mode[i], 5 + (88 * i), 30, 85, () => {
				uiButton.clicked = true;
				this.uiMode = uiMode;
				this.fieldPane.repaintTypeInfluence();
				this.draw();
			});
			if (i == 0) {
				this.canvasManagerUiMode.setClicked(uiButton);
			}
			this.canvasManagerUiMode.add(65, uiButton);
		}
		this.canvasManagerField.add(65, this.canvasManagerUiMode);
		this.canvasManagerField.add(70, this.infoField);

		this.canvasManagerAuction = new CanvasManager();
		this.canvasManagerAuction.enabled = false;
		this.canvasManagerAuction.add(90, this.auctionPanel);

		this.canvasManager = new CanvasManager();
		this.canvasManager.add(100, this.infoBar);
		this.canvasManager.add(80, this.cardLayouter);
		this.canvasManager.add(60, this.turnDoneButton);
		this.canvasManager.add(20, this.canvasManagerAuction);
		this.canvasManager.add(10, this.canvasManagerField);
	}

	draw() {
		this.ctx.beginPath();
		this.ctx.fillStyle = THEME.bg;
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		this.canvasManager.draw(this.ctx);
	}

	onclick(x, y) {
		this.canvasManager.onclick(x, y);
	}

	getButton(x, y) {
		return this.canvasManager.getButton();
	}

	resize() {
		this.canvasManager.resize();
		this.canvasManagerAuction.resize();
		this.canvasManagerField.resize();
	}
}
