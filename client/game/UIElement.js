/* ------------------------------------------ */
/* class UIElement */
/* ------------------------------------------ */
function UIElement(item) {  
	if(typeof item !== 'undefined') {
		this.drawX = item.x*55 + Math.floor(item.x/3)*5;
		this.drawY = item.y*55 + Math.floor(item.y/3)*5;
		this.x = item.x;
		this.y = item.y;
		this.width = 54;
		this.height = 54;    
		this.fillStyleH = null;//color highlight
		this.fillStyleS = null;//color selected
		this.fillStyleN = null;//color if no selection
		this.copyFrom(item);
		this.influenced = 0;
	}
}
UIElement.prototype.cor = function() {
	return this.x+":"+this.y;
}
UIElement.cor = function(item) {
	return item.x+":"+item.y;
}
UIElement.prototype.draw = function(ctx, relocateX, relocateY) {
	ctx.beginPath();
	
	// get the background-color
	if(this.fillStyleH != null) {
		ctx.fillStyle = this.fillStyleH;
	}
	else if(this.fillStyleS != null) {
		ctx.fillStyle = this.fillStyleS;
	}
	else if(this.type == 0) {
		// Type==HOUSE depends on the UI-mode
		switch(G.uiMode) {
			case 0:
				ctx.fillStyle = this.fillStyleUi0;
				break;
			/*case 1:
				ctx.fillStyle = this.fillStyleUi1;
				break;*/
			case 1:
				ctx.fillStyle = this.fillStyleUi2;
				break;
			case 2:
				ctx.fillStyle = this.fillStyleUi3;
				break;
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
				ctx.fillStyle = this.fillStyleUi4;
				break;
		}
	} 
	else {
		// Type!=HOUSE but not selected nor highlighted
		ctx.fillStyle = this.fillStyleN;
	}
	ctx.fillRect(relocateX+this.drawX,relocateY+this.drawY,this.width,this.height);

	if(this.owner == G.playerNo) {
		ctx.rect(relocateX+this.drawX+2,relocateY+this.drawY+2,this.width-4,this.height-4);
		ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.strokeStyle = 'black';
	}  

	ctx.fillStyle = 'white';
	if(this.type == 0) {
		switch(G.uiMode) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
				//ctx.fillText("H",relocateX+this.drawX+13,relocateY+this.drawY+14);		
				ctx.font = '9px Arial';				
				ctx.fillText(UIServices.getHouseTypeTextShort(this.attachedCard.houseType)+","+this.attachedCard.housePopulation,relocateX+this.drawX+3,relocateY+this.drawY+20);
				ctx.fillText(UIServices.getLocalLevelTextShort(this.localLevel),relocateX+this.drawX+3,relocateY+this.drawY+38);
				ctx.font = '10px sans-serif';						
				break;
				/*
			case 1:
				ctx.font = '9px Arial';				
				ctx.fillText(UIServices.getHouseTypeTextShort(this.attachedCard.houseType),relocateX+this.drawX+1,relocateY+this.drawY+19);
				ctx.font= '10px sans-serif';				
				break;
			case 2:
				ctx.fillText(this.attachedCard.housePopulation,relocateX+this.drawX+12,relocateY+this.drawY+19);
				break;
			case 3:
				ctx.font = '9px Arial';				
				ctx.fillText(UIServices.getLocalLevelTextShort(this.localLevel),relocateX+this.drawX+1,relocateY+this.drawY+19);
				ctx.font = '10px sans-serif';				
				break;*/
		}
	} else {
		ctx.fillText(this.fillText,relocateX+this.drawX+22,relocateY+this.drawY+28);
	}
};
UIElement.prototype.onclick = function(x, y) {
	if(this.atPos(x,y)) {
		if(G.fieldPane.selectTargetEnabled) {
			// this is a deploy
			if(G.fieldPane.isSelectable(this)) {
				G.serverCommListener.playCardSelectTarget(this);
				G.fieldPane.setSelectTargetEnabled(false);
			}
		} else {			
			// this is show/hide the info-field only
			G.fieldPane.showInfoField(this);
		}
		return true;
	}
	return false;
};  
UIElement.prototype.atPos = function(x, y) {
	if(x >= this.drawX && y >= this.drawY && x <= this.drawX+this.width && y <= this.drawY+this.height) {
		return true;
	}
	return false;
};
UIElement.prototype.copyFrom = function(from) {
	this.type = from.type;
	this.attachedCard = from.attachedCard;
	this.buildState = from.buildState;
	this.owner = from.owner;
	this.ownerName = from.ownerName;
	this.localLevel = from.localLevel;
	this.setBaseFillStyle();	
}
UIElement.prototype.getText = function() {
	return this.type + ", "+(this.attachedCard!=null? G.i18n[this.attachedCard.title]:'')+", "+this.buildState;
}
UIElement.prototype.setBaseFillStyle = function() {
	switch(this.type) {
		case -1:/*UNKNWON*/
			this.fillStyleN = '#333333';
			this.fillText = 'U';
			this.longText = 'Occupied';
			break;
		case 0:/*HOUSE*/
			this.fillStyleN = '#000000';
			this.fillText = 'H';
			this.longText = 'House';
			break;
		case 1:/*FOOD*/
			this.fillStyleN = '#00FF00';
			this.fillText = 'F';
			this.longText = 'Food';
			break;
		case 2:/*GROCERIES*/
			this.fillStyleN = '#00FF88';
			this.fillText = 'G';
			this.longText = 'Groceries';
			break;
		case 3:/*CLOTHING*/
			this.fillStyleN = '#88FF00';
			this.fillText = 'C';
			this.longText = 'Clothing';
			break;
		case 4:/*JEWELERY*/
			this.fillStyleN = '#88FF88';
			this.fillText = 'J';
			this.longText = 'Jewelery';
			break;
		case 5:/*ELECTRONIC*/
			this.fillStyleN = '#0088FF';
			this.fillText = 'E';
			this.longText = 'Electronic';
			break;
		case 6:/*LOCALLEVEL*/
			this.fillStyleN = '#8888FF';
			this.fillText = 'P';
			this.longText = 'Public Services';
			break;
	}

	if(this.attachedCard != null && this.type == 0) {
		if(this.attachedCard.houseType <= 1) {
			this.fillStyleUi0 = "#000000";
		} else if(this.attachedCard.houseType <= 2) {
			this.fillStyleUi0 = "#222222";
		} else if(this.attachedCard.houseType <= 3) {
			this.fillStyleUi0 = "#444444";
		} else if(this.attachedCard.houseType <= 5) {
			this.fillStyleUi0 = "#666666";
		} else if(this.attachedCard.houseType <= 7) {
			this.fillStyleUi0 = "#888888";
		} else if(this.attachedCard.houseType <= 9) {
			this.fillStyleUi0 = "#AAAAAA";
		}

		/*
		// Shows black/white where Gentrification makes sense since the current house-type is below the possible locallevel
		if(this.attachedCard.houseType > 1 && this.localLevel >= 300
			|| this.attachedCard.houseType > 2 && this.localLevel >= 100
			|| this.attachedCard.houseType > 5 && this.localLevel >= 30
			|| this.attachedCard.houseType > 8 && this.localLevel >= 0) {
			this.fillStyleUi1 = "#000000";
		} else {
			this.fillStyleUi1 = "#AAAAAA";
		}
		*/

		if(this.attachedCard.housePopulation/ UIServices.getMaxPop(this.attachedCard.houseType)<0.5) {
			this.fillStyleUi2 = "#000000";
		} else if(this.attachedCard.housePopulation/ UIServices.getMaxPop(this.attachedCard.houseType)<0.9) {
			this.fillStyleUi2 = "#555555";
		} else {
			this.fillStyleUi2 = "#AAAAAA";
		}

		var diffLevel=0;
		if(this.localLevel >= 300) {
			if(this.attachedCard.houseType > 8) {
				diffLevel = 4;
			} else if(this.attachedCard.houseType > 5) {
				diffLevel = 3;
			} else if(this.attachedCard.houseType > 2) {
				diffLevel = 2;
			} else if(this.attachedCard.houseType > 1) {
				diffLevel = 1;
			}
		} else if(this.localLevel >= 100) {
			if(this.attachedCard.houseType > 8) {
				diffLevel = 3;
			} else if(this.attachedCard.houseType > 5) {
				diffLevel = 2;
			} else if(this.attachedCard.houseType > 2) {
				diffLevel = 1;
			}
		} else if(this.localLevel >= 30) {
			if(this.attachedCard.houseType > 8) {
				diffLevel = 2;
			} else if(this.attachedCard.houseType > 5) {
				diffLevel = 1;
			}
		} else if(this.localLevel >= 0) {
			if(this.attachedCard.houseType > 8) {
				diffLevel = 1;
			}
		}
		switch(diffLevel) {
			case 0:
				this.fillStyleUi3 = "#BBBBBB";
				break;
			case 1:
				this.fillStyleUi3 = "#999999";
				break;
			case 2:
				this.fillStyleUi3 = "#666666";
				break;
			case 3:
				this.fillStyleUi3 = "#333333";
				break;
			case 4:
				this.fillStyleUi3 = "#000000";
				break;
		}

		switch(this.influenced) {
			case 0:
				this.fillStyleUi4 = "#000000";
				break;
			case 1:
				this.fillStyleUi4 = "#BBBBBB";
				break;
			case 2:
				this.fillStyleUi4 = "#444444";
				break;
			case 3:
				this.fillStyleUi4 = "#888888";
				break;
		}

	}	
}

