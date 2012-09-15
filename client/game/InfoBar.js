/* ------------------------------------------ */
/* class InfoBar */  
/* ------------------------------------------ */
function InfoBar() {
	this.money = -1;
	this.currentDate;
	this.playerNumber = -1;
	this.showLargeInfo = false;	
	this.draw = function(ctx) {  
		ctx.beginPath();
		ctx.rect(0,0,ctx.canvas.width,20);
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#000000';
		ctx.fillText(G.i18n.infoBar_cash+": $" + UIServices.addCommas(Math.floor(this.money)), 5, 13);
		ctx.fillText(G.i18n.infoBar_playernum+":" + this.playerNumber/*+" / "+G.gameState*/, 150, 13);
		ctx.fillText(G.i18n.infoBar_date+": "+this.currentDate, ctx.canvas.width-170, 13);
		if(this.showLargeInfo) {
			this.width = ctx.canvas.width-250;
			this.height = ctx.canvas.height-200;
			ctx.beginPath();
			ctx.fillStyle = '#8ED6FF';
			ctx.rect(100,100,this.width,this.height);
			ctx.fill();
			ctx.strokeStyle = 'black';
			ctx.stroke();
			ctx.fillStyle = '#000000';
			ctx.fillText(G.i18n.infoBar_balances, 110, 115);
			for (var i = 0; i < G.allPlayersData.length; i++) {
				var pd = G.allPlayersData[i];
				ctx.fillText(pd.name+": $" + UIServices.addCommas(Math.floor(pd.money))+(pd.conn?"":" (not connected)"), 120, 130+i*12);
			};
			ctx.fillText(G.i18n.infoBar_income_last_round, 330, 115);
			for (var i = 0; i < G.incomeReceipt.length; i++) {
				var ir = G.incomeReceipt[i];
				ctx.fillText(ir[0]+" got $" + UIServices.addCommas(Math.floor(ir[1]))+" from "+G.i18n[ir[2]]+" ("+ir[3]+","+ir[4]+")", 340, 130+i*12);
			}
		}
	};
	this.onclick = function(x, y) {
		if(this.atPos(x,y) && G.gameState == 1) {
			G.serverCommListener.requestAllPlayerData();
			this.showLargeInfo = !this.showLargeInfo;
			return true;
		}
		return false;
	};
	this.atPos = function(x, y) {
		 return this.showLargeInfo && x>100 && x<100+this.width && y>100 && y<100+this.height || y <= 20;
	};	

}