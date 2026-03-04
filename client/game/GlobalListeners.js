import { G } from './state.js';

export default class GlobalListeners {
	constructor() {
		let buttonDown = false;
		let moved = false;
		let startMoveX = 0;
		let startMoveY = 0;
		let mouseDownX = 0;
		let mouseDownY = 0;
		let buttonAtMouseDown = null;

		function getRelMousePos(canvas, evt) {
			let obj = canvas;
			let top = 0;
			let left = 0;
			while (obj && obj.tagName != 'BODY') {
				top += obj.offsetTop;
				left += obj.offsetLeft;
				obj = obj.offsetParent;
			}
			const mouseX = evt.clientX - left + window.pageXOffset;
			const mouseY = evt.clientY - top + window.pageYOffset;
			return { x: mouseX, y: mouseY };
		}

		G.canvas.addEventListener('mousemove', (evt) => {
			const mousePos = getRelMousePos(G.canvas, evt);
			if (buttonDown) {
				moved |= Math.abs(mousePos.x - mouseDownX) > 3 || Math.abs(mousePos.y - mouseDownY) > 3;
				G.fieldPane.relocateX += (mousePos.x - startMoveX);
				G.fieldPane.relocateY += (mousePos.y - startMoveY);
				startMoveX = mousePos.x;
				startMoveY = mousePos.y;
				G.draw();
			} else {
				G.fieldPane.moveover(mousePos.x, mousePos.y);
			}
		}, false);

		G.canvas.addEventListener('mouseout', () => {
			buttonDown = false;
		}, false);

		G.canvas.addEventListener('mousedown', (evt) => {
			const mousePos = getRelMousePos(G.canvas, evt);
			startMoveX = mouseDownX = mousePos.x;
			startMoveY = mouseDownY = mousePos.y;
			buttonDown = true;
			moved = false;
			buttonAtMouseDown = G.getButton(mousePos.x, mousePos.y);
		}, false);

		G.canvas.addEventListener('mouseup', (evt) => {
			buttonDown = false;
			const mousePos = getRelMousePos(G.canvas, evt);
			if (!moved || (buttonAtMouseDown !== false && G.getButton(mousePos.x, mousePos.y) === buttonAtMouseDown)) {
				G.onclick(mousePos.x, mousePos.y);
				G.draw();
			}
		}, false);

		window.addEventListener('resize', () => {
			const canvas = document.getElementById('gameCanvas');
			canvas.width = window.innerWidth - 225;
			canvas.height = window.innerHeight - 35;
			G.resize();
			G.draw();
		});

		// Keyboard shortcuts for canvas game interaction
		document.addEventListener('keydown', (evt) => {
			// Skip if user is typing in an input field
			if (evt.target.tagName === 'INPUT' || evt.target.tagName === 'SELECT' || evt.target.tagName === 'TEXTAREA') {
				return;
			}
			// Only handle when game canvas is visible
			if (document.getElementById('bottom').style.display === 'none') {
				return;
			}

			const key = evt.key;

			// Enter or 'e' — End Round / Submit Bid / Pick Card
			if (key === 'Enter' || key === 'e') {
				if (G.turnDoneButton.enabled) {
					G.serverCommListener.onTurnDone();
					G.draw();
				}
				evt.preventDefault();
				return;
			}

			// Digit keys 1-9: select cards (hand or auction depending on view)
			if (key >= '1' && key <= '9') {
				const idx = parseInt(key) - 1;
				if (G.canvasManagerAuction.enabled) {
					// Auction view: select auction card
					if (idx < G.auctionPanel.cards.length && G.auctionPanel.selectable) {
						const card = G.auctionPanel.cards[idx];
						if (!card.removed) {
							if (G.auctionPanel.currentlyClicked !== null && G.auctionPanel.currentlyClicked !== card) {
								G.auctionPanel.currentlyClicked.clicked = false;
							}
							if (card.clicked) {
								card.clicked = false;
								G.auctionPanel.currentlyClicked = null;
							} else {
								card.clicked = true;
								G.auctionPanel.currentlyClicked = card;
							}
							G.draw();
						}
					}
				} else {
					// Field view: toggle hand card
					if (idx < G.cardLayouter.cards.length && !G.cardLayouter.isLocked()) {
						const card = G.cardLayouter.cards[idx];
						G.cardLayouter.toggle(card);
						G.draw();
					}
				}
				evt.preventDefault();
				return;
			}

			// 'p' — Play the currently expanded card
			if (key === 'p') {
				const expanded = G.cardLayouter.currentlyExpanded;
				if (expanded && G.gameState == 1 && (G.availableActions & expanded.actionBit) == expanded.actionBit) {
					expanded.onPlayClicked();
				}
				evt.preventDefault();
				return;
			}

			// 'd' — Discard the currently expanded card
			if (key === 'd') {
				const expanded = G.cardLayouter.currentlyExpanded;
				if (expanded && G.gameState == 1) {
					expanded.onDiscardClicked();
				}
				evt.preventDefault();
				return;
			}

			// 'f' — Auto-place card on first valid cell (when in target selection mode)
			if (key === 'f') {
				if (G.fieldPane.selectTargetEnabled) {
					for (let i = 0; i < G.fieldPane.allElements.length; i++) {
						const el = G.fieldPane.allElements[i];
						if (G.fieldPane.isSelectable(el)) {
							G.serverCommListener.playCardSelectTarget(el);
							G.fieldPane.setSelectTargetEnabled(false);
							G.draw();
							break;
						}
					}
				}
				evt.preventDefault();
				return;
			}

			// 'c' — Cancel card placement
			if (key === 'c') {
				if (G.cardLayouter.isLocked()) {
					G.cardLayouter.unlock();
					G.draw();
				}
				evt.preventDefault();
				return;
			}

			// 'v' or Tab — Toggle auction/field view
			if (key === 'v' || key === 'Tab') {
				if (G.gameState == 2 || G.gameState == 3) {
					if (G.canvasManagerField.enabled) {
						G.canvasManagerAuction.enabled = true;
						G.canvasManagerField.enabled = false;
					} else {
						G.canvasManagerAuction.enabled = false;
						G.canvasManagerField.enabled = true;
					}
					G.draw();
				}
				evt.preventDefault();
				return;
			}

			// 'i' — Toggle player info overlay
			if (key === 'i') {
				G.serverCommListener.requestAllPlayerData();
				G.infoBar.showLargeInfo = !G.infoBar.showLargeInfo;
				G.draw();
				evt.preventDefault();
				return;
			}

			// 'm' — Cycle UI mode
			if (key === 'm') {
				const totalModes = G.canvasManagerUiMode.elements.length;
				if (totalModes > 0) {
					// Find current mode index
					let nextMode = (G.uiMode + 1) % totalModes;
					// Unclick old button
					if (G.canvasManagerUiMode.currrentlyClicked) {
						G.canvasManagerUiMode.currrentlyClicked.clicked = false;
					}
					G.uiMode = nextMode;
					const nextBtn = G.canvasManagerUiMode.elements[nextMode][2];
					nextBtn.clicked = true;
					G.canvasManagerUiMode.currrentlyClicked = nextBtn;
					G.fieldPane.repaintTypeInfluence();
					G.draw();
				}
				evt.preventDefault();
				return;
			}

			// Escape — Close expanded card / close info overlay
			if (key === 'Escape') {
				if (G.infoBar.showLargeInfo) {
					G.infoBar.showLargeInfo = false;
					G.draw();
				} else if (G.cardLayouter.isExpanded()) {
					G.cardLayouter.colapse();
					G.draw();
				} else if (G.infoField.visible) {
					G.infoField.visible = false;
					G.infoField.field = null;
					G.draw();
				}
				evt.preventDefault();
				return;
			}

			// Arrow keys — Pan the board
			const PAN_STEP = 40;
			if (key === 'ArrowLeft') { G.fieldPane.relocateX += PAN_STEP; G.draw(); evt.preventDefault(); return; }
			if (key === 'ArrowRight') { G.fieldPane.relocateX -= PAN_STEP; G.draw(); evt.preventDefault(); return; }
			if (key === 'ArrowUp') { G.fieldPane.relocateY += PAN_STEP; G.draw(); evt.preventDefault(); return; }
			if (key === 'ArrowDown') { G.fieldPane.relocateY -= PAN_STEP; G.draw(); evt.preventDefault(); return; }
		});
	}
}
