/* ------------------------------------------ */
/* class AuctionPanel */  
/* ------------------------------------------ */
function AuctionPanel() {
	this.cards = [];
	this.currentlyClicked = null;
	this.selectable = false;
	this.setCards = function(cards) {
		var x = 5;
		var y = 45;
		this.cards = [];
		for(var i = 0 ; i < cards.length ; i++) {
			var c = cards[i];
			var card = new AuctionCard(c.id, c.title, c.text, x, y, c.profitConfig, c.range, c.localLevelMod, c.type, G.ctx);
			this.cards.push(card);
			x += card.width+5;
		}	
	}
	this.removeCard = function(cardToRemove) {
		for(var i = 0 ; i < this.cards.length ; i++) {
			var card = this.cards[i];
			if(card.id === cardToRemove.id) {
				card.removed = true;
				if(card.clicked) {
					card.clicked = false;
					this.currentlyClicked = null;
				}
			}
		}		
	}
	this.draw = function(ctx) {  
		this.width = ctx.canvas.width-4;
		this.height = ctx.canvas.height-24;
		ctx.beginPath();
		ctx.fillStyle = '#000000';
		if(G.gameState==2) {
			ctx.fillText(G.i18n.auctionPanel_title1, 5, 33);
		} else {
			ctx.fillText(G.i18n.auctionPanel_title2, 5, 33);
		}
		for(var i = 0 ; i < this.cards.length ; i++) {
			var card = this.cards[i];
			card.draw(ctx);
		}

		if(G.gameState==2) {
			ctx.fillText(G.i18n.auctionPanel_enter_bid+" $", ctx.canvas.width-ctx.measureText(G.i18n.auctionPanel_enter_bid+" $").width-140, ctx.canvas.height-17);
		}
	};
	this.onclick = function(x, y) {
		if(this.selectable) {
			for(var i = 0 ; i < this.cards.length ; i++) {
				var card = this.cards[i];
				if(!card.removed && card.onclick(x,y)) {
					if(this.currentlyClicked!==null && this.currentlyClicked !== card) {
						this.currentlyClicked.clicked = false;
					}
					this.currentlyClicked = card;
					if(this.currentlyClicked.clicked) {
						this.currentlyClicked.clicked = false;
						this.currentlyClicked = null;
					} else {
						this.currentlyClicked.clicked = true;
					}				
				}
			}
		}
		return false;
	};
	this.atPos = function(x, y) {
	};	

}