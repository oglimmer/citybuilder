
const properties = require('properties');
const fs = require('fs');
const path = require('path');

// MUST NOT USE WINSTON!!!

let fileName = process.env.CITYBUILDER_PROPERTIES;
if (!fileName) {
  fileName = path.resolve(__dirname, 'citybuilder_default.properties');
}

console.log(`Using citybuilder.properties from ${fileName}`);
const propertiesFromFile = fs.readFileSync(fileName, { encoding: 'utf8' });

module.exports = properties.parse(propertiesFromFile, {
  sections: true,
  namespaces: true,
});
