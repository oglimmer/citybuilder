
var CardFactory = require('../server/rule_cardfactory.js');
var CardStack = require('../server/rule_cardstack.js');

module.exports = {

	create : function(test) {
		var cs = new CardStack();
		cs.create();
		test.done();
	},
	removeTop : function(test) {
		var cs = new CardStack();
		cs.create();
		var l1 = cs.length();
		var c = cs.removeTop();
		var l2 = cs.length();
		test.equal(l1,l2+1);
		test.ok(c !== null);
		test.ok(c.clazz === 'Card');
		test.done();
	},
	addTop : function(test) {
		var cs = new CardStack();
		cs.create();
		var l1 = cs.length();
		var c1 = "foo";
		cs.addTop(c1);
		var l2 = cs.length();
		var c2 = cs.removeTop();
		test.equal(c1,c2);
		test.equal(l1,l2-1);
		test.done();
	},
	removeCardById : function(test) {
		var cs = new CardStack();
		cs.create();
		var l1 = cs.length();
		cs.removeCardById(0);
		var l2 = cs.length();
		test.equal(l1,l2+1);
		test.done();
	},
	getById : function(test) {
		var cs = new CardStack();
		cs.create();
		var l1 = cs.length();
		var c = cs.getById(0);
		var l2 = cs.length();
		test.equal(l1,l2);
		test.ok(c !== null);
		test.ok(c.clazz === 'Card');		
		test.done();		
	},
	reinit : function(test) {
		var cardStack = {
			cards: []
		};
		CardStack.reinit(cardStack);
		var l1 = cardStack.length();
		var c1 = "foo";
		cardStack.addTop(c1);
		var l2 = cardStack.length();
		var c2 = cardStack.removeTop();
		test.equal(c1,c2);
		test.equal(l1,l2-1);
		test.done();
	}


}