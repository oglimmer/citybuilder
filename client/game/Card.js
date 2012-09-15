

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
	if(typeof(this.profitConfig) !== 'undefined') {
		for(var i = 0 ; i < this.profitConfig.length ; i++) {
			var pf = this.profitConfig[i];
			text += " ^$"+pf.pro+" pPpW für ";
			if(pf.ht.length == 1) {
				text += UIServices.getHouseTypeText(pf.ht[0]);
			} else {
				if(pf.ht[0] == 1 && pf.ht[1] == 10) {
					text += G.i18n.c_all_housetypes;
				} else {
					for(var j = pf.ht[0] ; j <= pf.ht[1] ; j++) {
						if(j!==pf.ht[0]) {
							text += " / ";
						}
						text += UIServices.getHouseTypeText(j);
					}
				}
			}
			text += ".";
		}
	}		
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

	//ctx.font = '11px sans-serif';	
	for ( var n = 0; n < words.length; n++) {
		if(words[n].charAt(0) == '^') {
			ctx.fillText(line, this.x+5, tmpY);			
			tmpY += 18; //lineHeight			
			line = "";
			words[n] = words[n].substring(1);
		}
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
	//ctx.font = '10px sans-serif';	
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
function Card(id,title,text,actionBit,playType,profitConfig,range,localLevelMod,type,ctx) {
	this.Inherits(BaseCard);
	this.id = id;
	this.title = title;
	this.text = text;
	this.actionBit = actionBit;
	this.playType = playType;
	this.profitConfig = profitConfig;
	this.range = range;
	this.localLevelMod = localLevelMod;
	this.type = type;
	this.x = null;
	this.height = 20;
	this.y = ctx.canvas.height-this.height;
	this.width = 180;
	this.expanded = false;
	this.clicked = false;
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
			this.height = 220;
			this.y = ctx.canvas.height-this.height;
			var self = this;	
			if((G.availableActions&this.actionBit)==this.actionBit) {
				G.canvasManagerField.addTemp(67, new Button(G.i18n.button_play,this,this.x,this.y-30,null, Card.onPlayClicked));
			}
			G.canvasManagerField.addTemp(67, new Button(G.i18n.button_discard,this,this.x+70,this.y-30,null, Card.onDiscardClicked));
		}		
		this.expanded = !this.expanded;
	};	
	this.draw = function(ctx) {  
		ctx.font = '12px Arial';
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
		if(typeof(this.type) !== 'undefined') {
			ctx.fillText(UIServices.getFieldType(this.type), this.x+this.width-ctx.measureText(this.type).width-4, this.y+12);
		}
		if(this.expanded) {
			this.drawText(ctx);
			this.drawText(ctx);
			if(typeof(this.range) !== 'undefined') {
				ctx.fillText("E:"+this.range, this.x+5, this.y+this.height-5);
			}	
			if(typeof(this.localLevelMod) !== 'undefined' && this.localLevelMod != 0) {
				var t = "S:"+this.localLevelMod;
				ctx.fillText(t, this.x+this.width-ctx.measureText(t).width-4, this.y+this.height-5);
			}		
		}
	};   	
}

/* ------------------------------------------ */
/* class AuctionCard */
/* ------------------------------------------ */
AuctionCard.Inherits(BaseCard);
function AuctionCard(id,title,text,x,y,profitConfig,range,localLevelMod,type,ctx) {
	this.Inherits(BaseCard);
	this.id = id;
	this.title = title;
	this.text = text;
	this.profitConfig = profitConfig;
	this.range = range;
	this.localLevelMod = localLevelMod;
	this.type = type;
	this.x = x;
	this.y = y;
	this.height = 220;
	this.width = 180;
	this.clicked = false;
	this.removed = false;
	this.draw = function(ctx) {  
		ctx.font = '12px Arial';	
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
		if(typeof(this.type) !== 'undefined') {
			ctx.fillText(UIServices.getFieldType(this.type), this.x+this.width-ctx.measureText(this.type).width-4, this.y+12);
		}
		this.drawText(ctx);
		if(typeof(this.range) !== 'undefined') {
			ctx.fillText("E:"+this.range, this.x+5, this.y+this.height-5);
		}	
		if(typeof(this.localLevelMod) !== 'undefined' && this.localLevelMod != 0) {
			var t = "S:"+this.localLevelMod;
			ctx.fillText(t, this.x+this.width-ctx.measureText(t).width-4, this.y+this.height-5);
		}		
	};    
}