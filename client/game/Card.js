/* Needed for Inheritence */
Function.prototype.Inherits = function(parent) {
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
};

/* ------------------------------------------ */
/* class BaseCard */
/* ------------------------------------------ */
function BaseCard() {
}
BaseCard.prototype.Inherits = function(parent) {
	if(arguments.length > 1) {
		parent.apply(this, Array.prototype.slice.call(arguments, 1) );
	} else {      
		parent.call(this);
	}
};
BaseCard.prototype.drawText = function(ctx) {
	var text = G.i18n[this.text];
	if(text.match(/\{.*\}/)) {
		var originalText = text;
		var pattern = /{[0-9]+,[0-9]+}/g;
		var toReplace = originalText.match(pattern);
		var textToken = originalText.split(pattern);
		var resultText = "";
		var j = 0;
		for(var i = 0 ; i < textToken.length ; i++) {
			resultText += textToken[i];
			if(i < textToken.length-1) {
				var tempTxt = toReplace[j++];
				tempTxt = tempTxt.substring(1, tempTxt.length-1);
				var start = parseInt(tempTxt.substring(0,tempTxt.indexOf(',')));
				var end = parseInt(tempTxt.substring(tempTxt.indexOf(',')+1));
				var tempTxtDisp = "";
				if(start == 1 && end == 10) {
					tempTxtDisp += G.i18n.c_all_housetypes;
				} else {
					for(var k = start ; k <= end ; k++) {
						if(k!==start) {
							tempTxtDisp += " / ";
						}
						tempTxtDisp += UIServices.getHouseTypeText(k);
					}
				}
				resultText += tempTxtDisp;
			}
		}
		text = resultText;
	}
	var words = text.split(" ");
	var line = "";
	var tmpY = this.y+28;

	ctx.font = '11px sans-serif';	
	for ( var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + " ";
		var metrics = ctx.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > this.width-4) {
			ctx.fillText(line, this.x+5, tmpY);
			line = words[n] + " ";
			tmpY += 12; //lineHeight
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, this.x+5, tmpY);
	ctx.font = '10px sans-serif';	
}
BaseCard.prototype.onclick = function(x, y) {   
	return this.atPos(x,y);
};
BaseCard.prototype.atPos = function(x, y) {   
	if(x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height) {
		return true;
	}
	return false;
};	

/* ------------------------------------------ */
/* class Card */
/* ------------------------------------------ */
Card.Inherits(BaseCard);
function Card(id,title,text,actionBit,playType,ctx) {
	this.Inherits(BaseCard);
	this.id = id;
	this.title = title;
	this.text = text;
	this.actionBit = actionBit;
	this.playType = playType;
	this.x = null;
	this.height = 20;
	this.y = ctx.canvas.height-this.height;
	this.width = 220;
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
	Card.onDiscardClicked = function(card) {
		G.serverCommListener.onCardDiscard(card);
		G.cardLayouter.cards.removeByObj(card);
		G.cardLayouter.colapse();
		G.draw();
	}
	Card.onCancelClicked = function(card) {
		G.cardLayouter.unlock();
		G.draw();
	}
	Card.onPlayClicked = function(card) {
		G.serverCommListener.onCardPlay(card);
		//G.cardLayouter.colapse();
		G.canvasManagerField.clearTemp();
		G.cardLayouter.lock(card);	
		G.canvasManagerField.addTemp(67, new Button(G.i18n.button_cancel,card,card.x,card.y-25,70, Card.onCancelClicked));
		G.draw();
	}
	this.toggle = function() {
		if(this.expanded) {
			this.height = 20;
			this.y = ctx.canvas.height-this.height;
		} else {
			this.height = 200;
			this.y = ctx.canvas.height-this.height;
			var self = this;	
			if((G.availableActions&this.actionBit)==this.actionBit) {
				G.canvasManagerField.addTemp(67, new Button(G.i18n.button_play,this,this.x,this.y-30,null, Card.onPlayClicked));
			}
			G.canvasManagerField.addTemp(67, new Button(G.i18n.button_discard,this,this.x+70,this.y-30,null, Card.onDiscardClicked));
		}		
		this.expanded = !this.expanded;
	};	
}

/* ------------------------------------------ */
/* class AuctionCard */
/* ------------------------------------------ */
AuctionCard.Inherits(BaseCard);
function AuctionCard(id,title,text,x,y,ctx) {
	this.Inherits(BaseCard);
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
}