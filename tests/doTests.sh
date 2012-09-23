#!/bin/sh

# see https://github.com/caolan/nodeunit

nodeunit tests/ioHandlerTest.js
nodeunit tests/cardstackTest.js
nodeunit tests/dateutilTest.js
nodeunit tests/fieldTest.js
nodeunit tests/gameCreatePlayerTest.js
nodeunit tests/gameChangePlayerTest.js
nodeunit tests/gameBiddingTest.js
nodeunit tests/gameRemoveCardFromAuctionTest.js
nodeunit tests/rentalcardProfitTest.js