/*Function.prototype.Inherits = function(parent) {
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
};

 ------------------------------------------ */
/* class Card */
/* ------------------------------------------ 
function BaseCard() {
}
BaseCard.prototype.Inherits = function(parent) {
	if(arguments.length > 1) {
		parent.apply(this, Array.prototype.slice.call(arguments, 1) );
	} else {      
		parent.call(this);
	}
};*/

/* ------------------------------------------ */
/* class Card */
/* ------------------------------------------ */
//BaseCard.Inherits(Card);
function Card(id,title,text,actionBit,playType,ctx) {
	//this.Inherits(Card);
	this.id = id;
	this.title = title;
	this.text = text;
	this.actionBit = actionBit;
	this.playType = playType;
	this.x = null;
	this.height = 20;
	this.y = ctx.canvas.height-this.height;
	this.width = 160;
	this.expanded = false;
	this.clicked = false;
	this.draw = function(ctx) {  
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		if(this.clicked) {
			ctx.fillStyle = '#FFFFFF';
		} else {
			ctx.fillStyle = '#2ED6FF';
		}		
		ctx.fill();
		ctx.stroke();
		if(this.expanded) {
			ctx.moveTo(this.x,this.y+15);
        	ctx.lineTo(this.x+this.width,this.y+15);
        	ctx.lineWidth = 1;
        	ctx.stroke();
        }
		ctx.fillStyle = '#000000';
		ctx.fillText(G.i18n[this.title]/*+" ("+this.id+")"*/, this.x+5, this.y+12);
		if(this.expanded) {
			this.drawText(ctx);
		}
	};    
	this.onclick = function(x, y) {   
		return this.atPos(x,y);
	};
	this.atPos = function(x, y) {   
		if(x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height) {
			return true;
		}
		return false;
	};	
	this.toggle = function() {
		if(this.expanded) {
			this.height = 20;
			this.y = ctx.canvas.height-this.height;
		} else {
			this.height = 160;
			this.y = ctx.canvas.height-this.height;
			var self = this;	
			if((G.availableActions&this.actionBit)==this.actionBit) {
				G.canvasManagerField.addTemp(67, new Button(G.i18n.button_play,this,this.x,this.y-30,null,function(card) {
					G.serverCommListener.onCardPlay(card);
					G.cardLayouter.colapse(card);
					G.cardLayouter.lock(card);
					
					G.canvasManagerField.addTemp(67, new Button(G.i18n.button_cancel,self,self.x,self.y-25,70,function(card) {
						G.cardLayouter.unlock();
						G.draw();
					}));

					G.draw();
				}));
			}
			G.canvasManagerField.addTemp(67, new Button(G.i18n.button_discard,this,this.x+70,this.y-30,null,function(card) {
				G.serverCommListener.onCardDiscard(card);
				G.cardLayouter.cards.removeByObj(card);
				G.cardLayouter.colapse(card);
				G.draw();
			}));
		}		
		this.expanded = !this.expanded;
	};
	this.drawText = function(ctx) {
		var words = G.i18n[this.text].split(" ");
		var line = "";
		var tmpY = this.y+28;

		for ( var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + " ";
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > this.width-2) {
				ctx.fillText(line, this.x+5, tmpY);
				line = words[n] + " ";
				tmpY += 12; //lineHeight
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, this.x+5, tmpY);
	}
}

/* ------------------------------------------ */
/* class AuctionCard */
/* ------------------------------------------ */
//BaseCard.Inherits(AuctionCard);
function AuctionCard(id,title,text,x,y,ctx) {
	//this.Inherits(AuctionCard);
	this.id = id;
	this.title = title;
	this.text = text;
	this.x = x;
	this.y = y;
	this.height = 160;
	this.width = 160;
	this.clicked = false;
	this.removed = false;
	this.draw = function(ctx) {  
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		if(this.clicked) {
			ctx.fillStyle = '#FFFFFF';
		} else if(this.removed) {
			ctx.fillStyle = 'red';
		} else {
			ctx.fillStyle = '#2ED6FF';
		}		
		ctx.fill();
		ctx.stroke();
		ctx.moveTo(this.x,this.y+15);
    	ctx.lineTo(this.x+this.width,this.y+15);
    	ctx.lineWidth = 1;
    	ctx.stroke();
		ctx.fillStyle = '#000000';
		ctx.fillText(G.i18n[this.title]/*+" ("+this.id+")"*/, this.x+5, this.y+12);
		this.drawText(ctx);
	};    
	this.onclick = function(x, y) {  
		return this.atPos(x,y);
	};
	this.atPos = function(x, y) {   
		if(x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height) {
			return true;
		}
		return false;
	};		
	this.drawText = function(ctx) {
		var words = G.i18n[this.text].split(" ");
		var line = "";
		var tmpY = this.y+28;

		for ( var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + " ";
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > this.width-2) {
				ctx.fillText(line, this.x+5, tmpY);
				line = words[n] + " ";
				tmpY += 12; //lineHeight
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, this.x+5, tmpY);
	}
}