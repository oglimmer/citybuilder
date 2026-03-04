import { THEME } from './state.js';

export default class Button {
	constructor(label, x, y, width, onclick) {
		this.label = label;
		this.width = width != null ? width : 70;
		this.height = 24;
		this.enabled = true;
		this.clicked = false;
		this._xFn = x;
		this._yFn = y;
		this._onclickFn = onclick;
		this.resize();
	}

	resize() {
		this.x = (typeof this._xFn === 'function' ? this._xFn() : this._xFn);
		this.y = (typeof this._yFn === 'function' ? this._yFn() : this._yFn);
	}

	draw(ctx) {
		const r = THEME.btnRadius;
		const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
		if (this.clicked) {
			grad.addColorStop(0, THEME.btnClicked);
			grad.addColorStop(1, THEME.btnClickedEnd);
		} else {
			grad.addColorStop(0, THEME.btnBg);
			grad.addColorStop(1, THEME.btnBgEnd);
		}
		ctx.beginPath();
		ctx.roundRect(this.x, this.y, this.width, this.height, r);
		ctx.fillStyle = grad;
		ctx.fill();
		ctx.strokeStyle = THEME.btnBorder;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.fillStyle = this.enabled ? THEME.btnText : THEME.btnDisabledText;
		const fontSize = this.width <= 85 ? 9 : 11;
		ctx.font = `${fontSize}px ${THEME.fontFamily}`;
		const text = typeof this.label === 'function' ? this.label() : this.label;
		const textWidth = ctx.measureText(text).width;
		ctx.fillText(text, this.x + (this.width - textWidth) / 2, this.y + (fontSize === 9 ? 15 : 16));
		ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		ctx.strokeStyle = '#000000';
	}

	onclick(x, y) {
		if (this.atPos(x, y)) {
			this._onclickFn();
			return true;
		}
		return false;
	}

	atPos(x, y) {
		return this.enabled && x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
	}
}
