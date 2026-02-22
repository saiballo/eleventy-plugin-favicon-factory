/**
* @preserve
* Filename: favicon.js
*
* Created: 15/04/2024 (18:41:03)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 21/02/2026 (18:42:55)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2024 - Tutti i diritti riservati
*
* Comments:
*/

const fs = require("node:fs");
const fsp = fs.promises;
const path = require("node:path");
const sharp = require("sharp");
const sharpIco = require("sharp-ico");
const toLog = require("./log.js");
const util = require("./utils.js");

/**
 * The function `createManifest` generates a manifest.json file with specified data and icons for a web application.
 * @param eleventyconfig - `eleventyconfig` is an object containing configuration settings for the Eleventy static site generator.
 * @param pluginconfig - pluginconfig is an object containing configuration settings for a plugin.
 * @param sizelist - The `sizelist` parameter is an array of sizes used to filter and map the iconList. It filters to include only 192, 256, and 512
 */
const createManifest = async (eleventyconfig, pluginconfig, sizelist) => {

	try {

		const filePath = util.getFilePath(pluginconfig.imgPathHref, pluginconfig.outputFolder);

		// if missing, create the output folder
		await util.checkFolder(path.join(eleventyconfig.dir.output, pluginconfig.manifestOutputFolder));

		// create the icon list filtering only 3 sizes
		const iconList = sizelist.filter((size) => [192, 256, 512].includes(size)).map((size) => ({
			"src": path.posix.join(filePath, `${pluginconfig.prefixName}-${size}x${size}.png`),
			"sizes": `${size}x${size}`,
			"type": "image/png"
		}));

		const manifestData = {
			"name": pluginconfig.manifestData.name,
			"short_name": pluginconfig.manifestData.shortName,
			"description": pluginconfig.manifestData.description,
			"start_url": pluginconfig.manifestData.startUrl,
			"display": pluginconfig.manifestData.display,
			"background_color": pluginconfig.manifestData.backgroundColor,
			"theme_color": pluginconfig.manifestData.themeColor,
			"icons": iconList
		};

		const manifestPath = path.join(eleventyconfig.dir.output, pluginconfig.manifestOutputFolder, `${pluginconfig.manifestName}.json`);

		await fsp.writeFile(manifestPath, JSON.stringify(manifestData, null, 2), "utf-8");

		toLog("manifest.json created successfully", "info");

	} catch (err) {

		toLog(`error while creating manifest.json: ${err.message}`, "error");
	}
};

/**
 * The function `getHtmlCode` generates HTML code for favicon and touch icons based on the provided configuration.
 * @param eleventyconfig - `eleventyconfig` is an object containing configuration settings for the Eleventy static site generator.
 * @param pluginconfig - pluginconfig is an object containing configuration settings for a plugin.
 * @returns it returns a formatted HTML code snippet based on the provided `eleventyconfig` and `pluginconfig` parameters.
 */
const getHtmlCode = (eleventyconfig, pluginconfig) => {

	const filePath = util.getFilePath(pluginconfig.imgPathHref, pluginconfig.outputFolder);
	const sizeList = Array.isArray(pluginconfig.sizeList) ? pluginconfig.sizeList : [];

	const htmlCode = [
		// universal fallback
		`<link rel="shortcut icon" href="${filePath}/${pluginconfig.prefixName}.ico" type="image/x-icon">`,
		// modern browsers
		`<link rel="icon" href="${filePath}/${pluginconfig.prefixName}.svg" type="image/svg+xml">`
	];

	// fallback some desktop browsers and modern mobile browsers: Chrome/Edge mobile
	if (sizeList.includes(32)) {

		htmlCode.push(`<link rel="icon" type="image/png" sizes="32x32" href="${filePath}/${pluginconfig.prefixName}-32x32.png">`);
	}

	if (sizeList.includes(16)) {

		htmlCode.push(`<link rel="icon" type="image/png" sizes="16x16" href="${filePath}/${pluginconfig.prefixName}-16x16.png">`);
	}

	if (sizeList.includes(512)) {

		htmlCode.push(`<link rel="apple-touch-icon" href="${filePath}/${pluginconfig.prefixName}-512x512.png">`);
	}

	// apple icon
	sizeList.forEach((size) => {

		if ([57, 72, 76, 114, 120, 144, 152, 180].includes(size)) {

			htmlCode.push(`<link rel="apple-touch-icon" sizes="${size}x${size}" href="${filePath}/${pluginconfig.prefixName}-${size}x${size}.png">`);
		}
	});

	// if required, generate the manifest html link
	if (pluginconfig.manifestGenerate) {

		const manifestPath = path.join(pluginconfig.manifestOutputFolder, `${pluginconfig.manifestName}.json`);

		htmlCode.push(`<link rel="manifest" href="/${manifestPath}">`);
	}

	// tutta questa pippa solo per mantenere la formattazione corretta. la prima riga viene ignorata
	return htmlCode.map((singleLine, index) => {

		if (index === 0) return singleLine;

		return "\t".repeat(pluginconfig.tabIndent) + singleLine;

	}).join("\n");
};

/**
 * The `favicon` function generates favicon files based on specified configurations and source image, and optionally creates a web app manifest file.
 * @param eleventyconfig - `eleventyconfig` is an object containing Eleventy configuration settings and methods. It is used to configure how Eleventy generates the static site.
 * @param pluginconfig - pluginconfig is an object containing configuration options for the favicon plugin.
 */
const favicon = (eleventyconfig, pluginconfig) => {

	let compilePromise = null;
	let devOnlyMsgShown = false;

	const skipProdCompile = () => {

		if (pluginconfig.runOnlyDevMode === true && process.env.NODE_ENV === "production") return true;

		return false;
	};

	const compileOnce = async (sourceimg) => {

		const isValidSource = await util.isFile(sourceimg);

		if (isValidSource === false) {

			toLog("source image not found. can't process favicon list", "error");
			return;
		}

		const outputDir = path.join(eleventyconfig.dir.output, pluginconfig.outputFolder);
		const isOutputFolder = await util.checkFolder(outputDir);

		// stop if output folder exists
		if (isOutputFolder === true) {

			toLog("favicon shortcode detected but output folder already exists. favicon generation skipped", "info");

			return;
		}

		toLog("starting favicons creation...", "info");

		util.copyFile(sourceimg, `${outputDir}/${pluginconfig.prefixName}.svg`);

		const isValidSizeList = Array.isArray(pluginconfig.sizeList) && pluginconfig.sizeList.length > 0;
		const sizeList = [
			...isValidSizeList ? pluginconfig.sizeList : [],
			...[512]
		];
		const uniqueSizeList = [...new Set(sizeList)];

		await Promise.all(uniqueSizeList.map((size) => {

			return sharp(sourceimg).resize(size).toFile(`${outputDir}/${pluginconfig.prefixName}-${size}x${size}.png`);
		}));

		// check if the 512x512 image exists
		const png512Path = `${outputDir}/${pluginconfig.prefixName}-512x512.png`;
		const isValid512 = await util.isFile(png512Path);

		if (isValid512 === false) return;

		// create the icon file format
		await sharpIco.sharpsToIco(
			[
				sharp(png512Path)
			],
			`${outputDir}/${pluginconfig.prefixName}.ico`,
			{
				"sizes": [64, 32, 24],
				"resizeOptions": {
					"fit": "cover"
				}
			}
		);

		if (pluginconfig.manifestGenerate === true) {

			await createManifest(eleventyconfig, pluginconfig, uniqueSizeList);
		}
	};

	eleventyconfig.addShortcode("favicon", async (sourceimg) => {

		// log once in production
		if (skipProdCompile() === true) {

			if (devOnlyMsgShown === false) {

				toLog("favicon compilation is required only in dev mode", "info");

				devOnlyMsgShown = true;
			}

			return getHtmlCode(eleventyconfig, pluginconfig);
		}

		// memoization: only once compile action
		if (compilePromise === null) {

			compilePromise = compileOnce(sourceimg);
		}

		await compilePromise;

		return getHtmlCode(eleventyconfig, pluginconfig);
	});
};

module["exports"] = favicon;
