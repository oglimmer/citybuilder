#!/usr/bin/env node

const fs = require('fs');

const log4js = require('log4js');
log4js.configure('./log4js_config.json', { reloadSecs: 300 });

const Config = require('./server/config');
const nano = require('nano')(Config.dbHost);

(async () => {
  try {
    await nano.db.destroy(Config.dbSchema);
  } catch(err) {
    // just ignore
  }
  try {
    await nano.db.create(Config.dbSchema);
    await nano.use(Config.dbSchema).insert(fs.readFileSync('./db/_design-game-view.json'));
  } catch(err) {
    // just ignore
  }

  require("./server/io.js");
})();
