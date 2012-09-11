/* ------------------------------------------ */
/* class CardLayouter */
/* ------------------------------------------ */
function CardLayouter(ctx) {

	this.cards = [];
	this.maxWidth = 600;
	this.currentlyExpanded = null;
	this.currentlyClicked = null;

	this.draw = function(ctx) {  
		for(var i = 0 ; i < this.cards.length ; i++) {
			var j = i < this.cards.length - 1 && this.cards[i].expanded ? i+1 : ( i>0 && this.cards[i-1].expanded ? i-1 : i);
			var card = this.cards[j];
			card.x = 10 + j*Math.min(this.maxWidth/this.cards.length, card.width+5);
			card.draw(ctx);
		}
	};
	this.toggle = function(card) {
		G.canvasManagerField.clearTemp();
		card.toggle();			
		if(this.currentlyExpanded!==null&&this.currentlyExpanded!==card) {
			this.currentlyExpanded.toggle();
		}
		this.currentlyExpanded = card.expanded ? card : null;		
	};
	this.onclick = function(x, y) {
		if(this.currentlyClicked===null) {
			for(var i = this.cards.length-1 ; i >= 0 ; i--) {
				var card = this.cards[i];
				if(card.onclick(x,y)) {
					this.toggle(card);
					return true;
				}
			}
		}
		return false;
	};  	
	this.atPos = function(x, y) {
		if(this.currentlyClicked===null) {
			for(var i = this.cards.length-1 ; i >= 0 ; i--) {
				var card = this.cards[i];
				if(card.atPos(x,y)) {					
					return true;
				}
			}
		}
		return false;
	};  
	this.isExpanded = function() {
		return this.currentlyExpanded !== null;	
	}
	this.expand = function(card) {
		if(this.isExpanded()) {
			this.colapse();
		}
		this.currentlyExpanded = card;
		this.currentlyExpanded.toggle();
	}
	this.colapse = function() {
		if(this.isExpanded()) {
			G.canvasManagerField.clearTemp();
			this.currentlyExpanded.toggle();			
			this.currentlyExpanded = null;
		}
	}
	this.isLocked = function() {
		return this.currentlyClicked !== null;
	}	
	this.lock = function(card) {
		if(this.isLocked()) {
			this.unlock();
		}
		this.currentlyClicked = card;
		this.currentlyClicked.clicked = true;
	}
	this.unlock = function() {
		if(this.isLocked()) {
			this.colapse();
			G.canvasManagerField.clearTemp(); // there could be buttons even not expanded
			this.currentlyClicked.clicked = false;
			this.currentlyClicked = null;				
			G.fieldPane.setSelectTargetEnabled(false);
		}
	}
}