/**
* @preserve
* Filename: favicon.js
*
* Created: 15/04/2024 (18:41:03)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 22/04/2025 (13:39:25)
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
		await util.isFolder(path.join(eleventyconfig.dir.output, pluginconfig.manifestOutputFolder));

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

	const htmlCode = [
		// universal fallback
		`<link rel="shortcut icon" href="${filePath}/${pluginconfig.prefixName}.ico" type="image/x-icon"></link>`,
		// modern browsers
		`<link rel="icon" href="${filePath}/${pluginconfig.prefixName}.svg" type="image/svg+xml">`
	];

	// fallback some desktop browsers and modern mobile browsers: Chrome/Edge mobile
	if (pluginconfig.sizeList.includes(32)) {

		htmlCode.push(`<link rel="icon" type="image/png" sizes="32x32" href="${filePath}/${pluginconfig.prefixName}-32x32.png">`);
	}

	if (pluginconfig.sizeList.includes(16)) {

		htmlCode.push(`<link rel="icon" type="image/png" sizes="16x16" href="${filePath}/${pluginconfig.prefixName}-16x16.png">`);
	}

	if (pluginconfig.sizeList.includes(512)) {

		htmlCode.push(`<link rel="apple-touch-icon" href="${filePath}/apple-touch-icon.png">`);
	}

	// apple icon
	pluginconfig.sizeList.forEach((size) => {

		if ([57, 72, 76, 114, 120, 144, 152, 180].includes(size)) {

			htmlCode.push(`<link rel="apple-touch-icon" sizes="${size}x${size}" href="${filePath}/apple-touch-icon-${size}x${size}.png">`);
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

	eleventyconfig.addShortcode("favicon", async (sourceimg) => {

		if (pluginconfig.runOnlyDevMode === true && process.env.NODE_ENV === "production") {

			toLog("favicon compilation is required only in dev mode", "info");

			return getHtmlCode(eleventyconfig, pluginconfig);
		}

		try {

			const outputDir = path.join(eleventyconfig.dir.output, pluginconfig.outputFolder);
			const isOutputFolder = await util.isFolder(outputDir);

			// if the folder didn't exist, it was created and therefore the favicons must be processed or the build is done
			if (!isOutputFolder || process.env.NODE_ENV === "production") {

				// check if the source image exists
				const isValidSource = await util.isFile(sourceimg);

				// if it doesn't exist, i can't proceed
				if (!isValidSource) return false;

				toLog("starting favicons creation...", "info");

				util.copyFile(sourceimg, `${outputDir}/${pluginconfig.prefixName}.svg`);

				const isValidSizeList = Array.isArray(pluginconfig.sizeList) && pluginconfig.sizeList.length > 0;
				const sizeList = [
					...isValidSizeList ? pluginconfig.sizeList : [],
					...[512]
				];
				const uniqueSizeList = [...new Set(sizeList)];

				await Promise.all(
					uniqueSizeList.map((size) => sharp(sourceimg).resize(size).toFile(`${outputDir}/${pluginconfig.prefixName}-${size}x${size}.png`))
				);

				// check if the 512x512 image exists
				const png512Path = `${outputDir}/${pluginconfig.prefixName}-512x512.png`;
				const isValid512 = await util.isFile(png512Path);

				if (!isValid512) return false;

				// create the icon file format
				await sharpIco.sharpsToIco(
					[
						sharp(`${outputDir}/${pluginconfig.prefixName}-512x512.png`)
					],
					`${outputDir}/${pluginconfig.prefixName}.ico`,
					{
						"sizes": [64, 32, 24],
						"resizeOptions": {
							"fit": "cover"
						}
					}
				);

				// if needed, create the manifest file
				if (pluginconfig.manifestGenerate) {

					await createManifest(eleventyconfig, pluginconfig, uniqueSizeList);
				}
			}

			return getHtmlCode(eleventyconfig, pluginconfig);

		} catch (err) {

			toLog(`${err["message"]}`, "error");
		}
	});
};

module["exports"] = favicon;
