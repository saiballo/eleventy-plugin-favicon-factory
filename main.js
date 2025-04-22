/**
* @preserve
* Filename: main.js
*
* Created: 15/04/2024 (18:41:03)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 22/04/2025 (15:34:34)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2024 - Tutti i diritti riservati
*
* Comments:
*/

const favicon = require("./src/favicon.js");
const pkg = require("./package.json");
const toLog = require("./src/log.js");

const defaultConfig = {
	// output folder for img files. it's relative to "dist" project folder
	"outputFolder": "favicon",
	// image name prefix for generated img files
	"prefixName": "favicon",
	// usually left empty
	"imgPathHref": "",
	// generate manifest file
	"manifestGenerate": true,
	// manifest file name
	"manifestName": "manifest",
	// output folder for manifest file. it's relative to "dist" project folder. leave it empty to put in root dist
	"manifestOutputFolder": "",
	// manifest data
	"manifestData": {
		"name": "MyApp",
		"shortName": "MyApp but short",
		"description": "Progressive Web App",
		"startUrl": "/",
		"display": "standalone",
		"backgroundColor": "#ffffff",
		"themeColor": "#000000"
	},
	"sizeList": [
		// standard favicon for old browsers address bar
		16,
		// hd favicon for browser address bar. minimun size for windows 10
		32,
		// windows app / desktop
		48,
		// iphone (ios 6 or below)
		57,
		// ipad (ios 6 or below)
		72,
		// ipad (ios 7+)
		76,
		// android chrome (tab icon or shortcut)
		96,
		// iphone retina (ios 6 or below)
		114,
		// iphone retina (ios 7+)
		120,
		// android, windows
		144,
		// ipad retina (ios 7+)
		152,
		// iphone retina hd (ios 8+) – most common today
		180,
		// android or pwa
		192,
		// windows/chrome desktop
		256,
		// required for android 8.0+ and pwa
		512
	],
	// generate favicon files and manifest only in dev mode. set to false to generate them in production mode too
	"runOnlyDevMode": true,
	// indentation for generated html code
	"tabIndent": 2
};

module.exports = (eleventyconfig, config = {}) => {

	try {

		// merge defaultConfig with custom config
		const pluginConfig = {
			...defaultConfig,
			...config
		};

		eleventyconfig.versionCheck(pkg["11ty"].compatibility);

		favicon(eleventyconfig, pluginConfig);

	} catch (err) {

		toLog(err, "error");
	}
};
