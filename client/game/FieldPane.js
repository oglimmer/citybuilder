/* ------------------------------------------ */
/* class FieldPane */
/* ------------------------------------------ */
function FieldPane() {

	this.relocateX = 0;  
	this.relocateY = 0;
	this.allElements = [];
	this.allElementsByCor = {};
	this.currentHighlight = [];
	this.selectTargetEnabled = false;
	this.surroundingMatrix = [];
	this.selectableType = null;

	FieldPane.createSurroundingRange = function(range) {
		surroundingMatrix = [];
		for(var x = -range ; x <= range ; x++) {
			for(var y = -range ; y <= range ; y++) {
				if(x!=0 || y!=0) {
					surroundingMatrix.push([x,y]);
				}
			}
		}
		return surroundingMatrix;
	};
	this.isSelectable = function(field) {
		if(this.selectableType === null) {
			return true;
		}
		if(this.selectableType === 'ALL_UNOCCUPIED') {
			return field.type == 0;
		}
		if(this.selectableType.match(/ALL_OCCUPIED_BY_/) !== null) {
			return field.type == this.selectableType.match(/[0-9].*$/);
		}
		if(this.selectableType.match(/ALL_UNOCCUPIED_ABOVE_/) !== null) {
			return field.type == 0 && field.attachedCard.houseType > this.selectableType.match(/[0-9].*$/);
		}
		if(this.selectableType.match(/ALL_UNOCCUPIED_LOWER_/) !== null) {
			return field.type == 0 && field.attachedCard.houseType < this.selectableType.match(/[0-9].*$/);
		}
		return false;
	};
	this.showInfoField = function(field) {
		G.infoField.visible = !G.infoField.visible;
		var fieldToUpdate = G.infoField.visible ? field : G.infoField.field;
		G.infoField.setField(G.infoField.visible?field:null);
		if(fieldToUpdate.attachedCard !==null) {
			var selRange = FieldPane.createSurroundingRange(fieldToUpdate.attachedCard.range);
			for(var j = 0 ; j < selRange.length ; j++) {
				var surroundingElement = this.allElementsByCor[(fieldToUpdate.x+selRange[j][0])+":"+(fieldToUpdate.y+selRange[j][1])];
				if(typeof surroundingElement !== 'undefined') {
					// change color of ranged-fields for currently selected field on InfoField
					surroundingElement.fillStyleS = G.infoField.visible ? '#440000' : null;
					surroundingElement.draw(G.ctx, this.relocateX, this.relocateY);
				}
			}
		}
		// change the color for the selected field (shown in the infoField)
		fieldToUpdate.fillStyleS =  G.infoField.visible ? '#123456' : null;		
	};
	this.draw = function(ctx) {  
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var uiElement = this.allElements[i];
			uiElement.draw(ctx, this.relocateX, this.relocateY);
		}
	};
	this.onclick = function(x, y) {
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var uiElement = this.allElements[i];
			if(uiElement.onclick(x-this.relocateX, y-this.relocateY)) {
				return true;
			}
		}
		return false;
	};
	this.processReceived = function(/*Object of "x:y" => Field*/data) {

		for (var itemKey in data) {
			var item = data[itemKey];
			if(typeof item === 'object') {
				var found = false;
				for(var i = 0 ; i < this.allElements.length ; i++) {
					var uiElement = this.allElements[i];
					if(uiElement.x == item.x && uiElement.y == item.y) {
						found = true;
						/* update */
						uiElement.copyFrom(item);
						break;
					} 
				}
				if(!found) {
					/* create */
					var e = new UIElement(item);
					this.allElements.push(e);
					this.allElementsByCor[UIElement.cor(item)] = e;
				}
			}
		}
		this.repaintTypeInfluence();
		G.draw();
	};
	this.moveover = function(x,y) {
		if(!this.selectTargetEnabled) {
			return;
		}
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var uiElement = this.allElements[i];
			if(this.isSelectable(uiElement) && (this.currentHighlight.length == 0 || this.currentHighlight[0] !== uiElement) && uiElement.atPos(x-this.relocateX, y-this.relocateY)) {

				// since the cursor moved to another field, remove "range field"
				for(var j = 0 ; j < this.currentHighlight.length ; j++) {
					this.currentHighlight[j].fillStyleH = null;
					this.currentHighlight[j].draw(G.ctx, this.relocateX, this.relocateY);
				}
				this.currentHighlight = [];

				// high-light field currently under the cursor
				uiElement.fillStyleH = 'yellow';
				uiElement.draw(G.ctx, this.relocateX, this.relocateY);
				this.currentHighlight.push(uiElement);

				// create the "range field"
				for(var j = 0 ; j < this.surroundingMatrix.length ; j++) {
					var surroundingElement = this.allElementsByCor[(uiElement.x+this.surroundingMatrix[j][0])+":"+(uiElement.y+this.surroundingMatrix[j][1])];
					if(typeof surroundingElement !== 'undefined') {
						surroundingElement.fillStyleH = surroundingElement.type == 0 ? 'red' : '#440000';
						surroundingElement.draw(G.ctx, this.relocateX, this.relocateY);
						this.currentHighlight.push(surroundingElement);
					}
				}

				break;
			}
		}
		return false;
	};
	/**
	 * changes selectTargetEnabled. If set to false, also removes the "range field". 
	 */
	this.setSelectTargetEnabled = function(val) {
		this.selectTargetEnabled = val;
		if(!this.selectTargetEnabled) {
			for(var j = 0 ; j < this.currentHighlight.length ; j++) {
				this.currentHighlight[j].fillStyleH = null;
				this.currentHighlight[j].draw(G.ctx, this.relocateX, this.relocateY);
			}
			this.currentHighlight = [];
		}
	}

	this.repaintTypeInfluence = function() {
		if(G.uiMode>=3&&G.uiMode<=8) {
			this.calcRanges(G.uiMode-2);
		}		
	}

	this.calcRanges = function(type) {
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var field = this.allElements[i];
			if(field.type == 0 ) {
				field.influenced = 0;
			}
		}
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var field = this.allElements[i];
			if(field.type == type ) {
				this.forEachField(field.attachedCard.range, field, this.allElementsByCor, function(surrField) {
					if(surrField.type == 0) {
						if(field.owner == G.playerNo) {
							surrField.influenced |= 1;
						} else {
							surrField.influenced |= 2;
						}
					}
				});
			}
		}
		for(var i = 0 ; i < this.allElements.length ; i++) {
			var field = this.allElements[i];
			if(field.type == 0 ) {
				field.setBaseFillStyle();
			}
		}
	}

	this.forEachField = function(range, field, fields, perField) {
		for(var x = -range ; x <= range ; x++) {
			for(var y = -range ; y <= range ; y++) {
				if(x!=0 || y!=0) {
					var surroundingElement = fields[(field.x+x)+":"+(field.y+y)];
					if(typeof surroundingElement !== 'undefined') {
						perField(surroundingElement);
					}
				}
			}
		}
	};

}
