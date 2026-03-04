import { G, THEME } from './state.js';
import UIServices from './UIServices.js';

export default class InfoBar {
	constructor() {
		this.money = -1;
		this.currentDate = undefined;
		this.playerNumber = -1;
		this.showLargeInfo = false;
	}

	draw(ctx) {
		const barH = 24;
		const grad = ctx.createLinearGradient(0, 0, 0, barH);
		grad.addColorStop(0, THEME.infoBarBg);
		grad.addColorStop(1, THEME.infoBarBgEnd);
		ctx.beginPath();
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, ctx.canvas.width, barH);
		// subtle bottom separator
		ctx.strokeStyle = THEME.panelBorder;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, barH);
		ctx.lineTo(ctx.canvas.width, barH);
		ctx.stroke();
		ctx.strokeStyle = '#000000';

		ctx.fillStyle = THEME.infoBarText;
		ctx.font = `11px ${THEME.fontFamily}`;
		ctx.fillText(`${G.i18n.infoBar_cash}: $${UIServices.addCommas(Math.floor(this.money))}`, 8, 16);
		ctx.fillText(`${G.i18n.infoBar_playernum}:${this.playerNumber}`, 155, 16);
		ctx.fillText(`${G.i18n.infoBar_date}: ${this.currentDate}`, ctx.canvas.width - 175, 16);
		ctx.fillStyle = THEME.accent;
		ctx.fillText(G.i18n.infoBar_other_players, 495 - ctx.measureText(G.i18n.infoBar_other_players).width, 16);
		if (G.gameState == 2 || G.gameState == 3) {
			ctx.fillText(G.i18n.infoBar_switch_ui, 505, 16);
		}
		ctx.fillStyle = THEME.infoBarText;
		ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;

		if (this.showLargeInfo) {
			this.width = ctx.canvas.width - 250;
			this.height = ctx.canvas.height - 200;
			const panelX = 100, panelY = 100;
			ctx.beginPath();
			ctx.roundRect(panelX, panelY, this.width, this.height, 10);
			ctx.fillStyle = THEME.infoFieldBg;
			ctx.fill();
			ctx.strokeStyle = THEME.infoFieldBorder;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.strokeStyle = '#000000';
			ctx.font = `bold 12px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldHeader;
			ctx.fillText(G.i18n.infoBar_balances, 115, 122);
			ctx.font = `11px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldText;
			for (let i = 0; i < G.allPlayersData.length; i++) {
				const pd = G.allPlayersData[i];
				ctx.fillText(`${pd.name}: $${UIServices.addCommas(Math.floor(pd.money))}${pd.conn ? '' : ' (not connected)'}`, 125, 140 + i * 14);
			}
			ctx.font = `bold 12px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldHeader;
			ctx.fillText(G.i18n.infoBar_income_last_round, 335, 122);
			ctx.font = `11px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldText;
			for (let i = 0; i < G.incomeReceipt.length; i++) {
				const ir = G.incomeReceipt[i];
				ctx.fillText(`${ir[0]} got $${UIServices.addCommas(Math.floor(ir[1]))} from ${G.i18n[ir[2]]} (${ir[3]},${ir[4]})`, 345, 140 + i * 14);
			}
			ctx.font = `bold 12px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldHeader;
			ctx.fillText(G.i18n.infoBar_last_bids, 625, 122);
			ctx.font = `11px ${THEME.fontFamily}`;
			ctx.fillStyle = THEME.infoFieldText;
			for (let i = 0; i < G.lastBids.length; i++) {
				const bids = G.lastBids[i];
				ctx.fillText(`${bids.playerName} bid $${UIServices.addCommas(Math.floor(bids.bid))} and paid $${UIServices.addCommas(Math.floor(bids.cost))}`, 635, 140 + i * 14);
			}
			ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		}
	}

	onclick(x, y) {
		if (this.atPos(x, y)) {
			if (x >= 500 && (G.gameState == 2 || G.gameState == 3)) {
				if (G.canvasManagerField.enabled) {
					G.canvasManagerAuction.enabled = true;
					G.canvasManagerField.enabled = false;
				} else {
					G.canvasManagerAuction.enabled = false;
					G.canvasManagerField.enabled = true;
				}
				return true;
			}
			if (x < 500) {
				G.serverCommListener.requestAllPlayerData();
				this.showLargeInfo = !this.showLargeInfo;
				return true;
			}
		}
		return false;
	}

	atPos(x, y) {
		return (this.showLargeInfo && x > 100 && x < 100 + this.width && y > 100 && y < 100 + this.height) || y <= 24;
	}
}
