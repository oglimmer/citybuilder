/* ------------------------------------------ */
/* class Global */
/* ------------------------------------------ */
function Global() {
	this.canvas = document.getElementById('gameCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.uiMode = 0;
	this.playerId = null; // identifier, secret
	this.playerNo = null; // counting number, public
	this.gameState = 0;

	this.i18n = I18n[Cookie.get("lang")];
	this.serverCommListener = new ServerCommListener();
	this.fieldPane = new FieldPane();
	this.turnDoneButton = new Button(this.i18n.button_endRound, this, this.ctx.canvas.width-70, this.ctx.canvas.height-30, null, this.serverCommListener.onTurnDone);	
	this.infoField = new InfoField(this.ctx);
	this.cardLayouter = new CardLayouter(this.ctx);
	this.infoBar = new InfoBar();
	this.auctionPanel = new AuctionPanel();
	this.availableActions = 0;
	this.allPlayersData = [];
	this.incomeReceipt = [];

	this.fieldPane.relocateX = 250;
	this.fieldPane.relocateY = 125;
	
	this.canvasManagerField = new CanvasManager();
	this.canvasManagerField.add(0, this.fieldPane);

	this.canvasManagerUiMode = new CanvasManagerUIMode();
	for(var i = 0 ; i < 2+NUMBER_OF_FIELD_TYPES ; i++) {
		var uiButton = new Button(this.i18n.uiSwitchButtonText_mode[i], this, 10+(105*i), 30, 100, function(parent, self) { self.clicked = true; G.uiMode = self.contextParam ; G.fieldPane.repaintTypeInfluence(); G.draw(); }, i);
		if(i==0) {
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


	this.draw = function() {
		this.ctx.beginPath();
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.canvasManager.draw(this.ctx);
	}
	this.onclick = function(x,y) {
		this.canvasManager.onclick(x,y);
	}
	this.getButton = function(x,y) {
		return this.canvasManager.getButton();
	}

	this.resize = function() {
		this.turnDoneButton.x = this.ctx.canvas.width-70;
		this.turnDoneButton.y = this.ctx.canvas.height-30;
		for(var ind in this.cardLayouter.cards) {
			var card = this.cardLayouter.cards[ind];
			if(typeof(card) === 'object') {
				card.y = this.ctx.canvas.height-card.height;
			}
		}
		this.infoField.x = this.ctx.canvas.width-250;	
		/*for(var i = 0 ; i < this.dynamicButtons.length ; i++) {
			this.dynamicButtons[i].y = ???
		}*/		
	};
}

