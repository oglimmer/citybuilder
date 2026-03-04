export class CanvasManager {
	constructor() {
		this.elements = [];
		this.enabled = true;
	}

	add(zindex, element) {
		this.elements.push([zindex, false, element]);
		this.elements.sort((a, b) => a[0] - b[0]);
	}

	addTemp(zindex, element) {
		this.elements.push([zindex, true, element]);
		this.elements.sort((a, b) => a[0] - b[0]);
	}

	clearTemp() {
		for (let i = this.elements.length - 1; i >= 0; i--) {
			if (this.elements[i][1]) {
				this.elements.splice(i, 1);
			}
		}
	}

	draw(ctx) {
		if (this.enabled) {
			for (let i = 0; i < this.elements.length; i++) {
				this.elements[i][2].draw(ctx);
			}
		}
	}

	onclick(x, y) {
		if (this.enabled) {
			for (let i = this.elements.length - 1; i >= 0; i--) {
				const ele = this.elements[i][2];
				if (typeof ele.onclick === 'function' && ele.onclick(x, y)) {
					return true;
				}
			}
		}
		return false;
	}

	getButton(x, y) {
		if (this.enabled) {
			for (let i = this.elements.length - 1; i >= 0; i--) {
				const ele = this.elements[i][2];
				if (typeof ele.atPos === 'function' && ele.atPos(x, y)) {
					return ele;
				} else if (typeof ele.getButton === 'function' && ele.getButton(x, y)) {
					return ele;
				}
			}
		}
		return false;
	}

	resize() {
		for (let i = this.elements.length - 1; i >= 0; i--) {
			const ele = this.elements[i][2];
			if (typeof ele.resize === 'function') {
				ele.resize();
			}
		}
	}
}

export class CanvasManagerUIMode extends CanvasManager {
	onclick(x, y) {
		if (this.enabled) {
			for (let i = this.elements.length - 1; i >= 0; i--) {
				const ele = this.elements[i][2];
				if (typeof ele.onclick === 'function' && ele.onclick(x, y)) {
					if (typeof this.currrentlyClicked !== 'undefined' && this.currrentlyClicked !== ele) {
						this.currrentlyClicked.clicked = false;
					}
					this.currrentlyClicked = ele;
					return true;
				}
			}
		}
		return false;
	}

	setClicked(ele) {
		this.currrentlyClicked = ele;
		ele.clicked = true;
	}
}
