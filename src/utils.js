/**
* @preserve
* Filename: utils.js
*
* Created: 15/04/2024 (18:41:03)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 22/04/2025 (13:38:40)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2024 - Tutti i diritti riservati
*
* Comments:
*/

"use strict";

const fs = require("node:fs");
const fsp = fs.promises;
const toLog = require("./log.js");

/**
 * The function `getFilePath` returns a file path based on the input filepath and output folder.
 * @param filepath - The `filepath` parameter is a string representing the path to a file.
 * @param outputfolder - The `outputfolder` parameter is a string representing the folder where the output file will be saved.
 * @returns The function `getFilePath` returns the `filePath` variable, which is determined based on the `filepath` and `outputfolder` parameters.
 */
const getFilePath = (filepath, outputfolder) => {

	// eslint-disable-next-line prefer-template
	const filePath = filepath !== "" ? filepath : "/" + outputfolder.replace(/^\/+/, "");

	return filePath;
};

/**
 * The `copyFile` function copies a file from a source location to a destination location and logs the result.
 * @param source - The `source` parameter in the `copyFile` function is the path to the file that you want to copy.
 * @param destination - The `destination` parameter in the `copyFile` function refers to the path where the source file will be copied to.
 */
const copyFile = async (source, destination) => {

	try {

		const fileName = source.split("/").pop();

		await fsp.copyFile(source, destination);

		toLog(`${fileName} copied successfully`, "info");

	} catch (err) {

		toLog(`error copy source file ${source}: ${err.message}`, "error");

		throw err;
	}
};

/**
 * The function `isFolder` checks if a folder exists, creates it if it doesn't, and logs any errors encountered.
 * @param folder - it represents the path to a directory that you want to check if it exists. If the directory exists, the function will return `true`.
 * If the directory does not exist, the function will create it using `fsp.mkdir` with the `recursive
 * @returns If the folder exists, `true` is being returned. If the folder does not exist and is successfully created, `false` is being returned.
 */
const isFolder = async (folder) => {

	try {

		if (fs.existsSync(folder)) return true;

		// se non esiste, la creiamo
		await fsp.mkdir(folder, {
			"recursive": true
		});

		toLog("output folder created. Processing favicons...", "info");

		return false;

	} catch (err) {

		toLog(`error creating folder ${folder}: ${err.message}`, "error");

		throw err;
	}
};

/**
 * The function `isFile` checks if a file exists at the specified filepath and returns true if it does, false if it doesn't.
 * @param filepath - The `filepath` parameter in the `isFile` function is a string that represents the path to a file that you want to check for existence.
 * @returns The `isFile` function returns a boolean value. It returns `true` if the file at the specified `filepath` exists, and `false` if the file does not exist.
 */
const isFile = async (filepath) => {

	try {

		await fsp.access(filepath);

		return true;

	} catch (err) {

		if (err["code"] === "ENOENT") {

			toLog(`file ${filepath} does not exist`, "error");

			return false;
		}

		toLog(err, "error");

		throw err;
	}
};

module["exports"] = {
	getFilePath,
	copyFile,
	isFile,
	isFolder
};
