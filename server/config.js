import properties from 'properties';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// MUST NOT USE WINSTON!!!

let fileName = process.env.CITYBUILDER_PROPERTIES;
if (!fileName) {
	fileName = resolve(import.meta.dirname, 'citybuilder_default.properties');
}

console.log(`Using citybuilder.properties from ${fileName}`);
const propertiesFromFile = readFileSync(fileName, { encoding: 'utf8' });

export default properties.parse(propertiesFromFile, {
	sections: true,
	namespaces: true,
});
