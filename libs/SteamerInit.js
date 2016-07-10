"use strict";
/**
 * init steamer.config.js
 * by heyli 2016.06.23
 */

const path = require('path'),
	  fs = require('fs'),
	  Warning = require('../libs/SteamerErrWarning'),
	  Logger = require('../libs/SteamerLogger');

function initSteamerConfig() {
	// avoid overriding
	let configSrcPath = path.join(__dirname, '../template/steamer.config.js'),
		configDestPath = path.resolve('steamer.config.js');
	if (fs.existsSync(configDestPath)) {
		throw new Warning.FileExistErr("steamer.config.js");
	}

	let configStr = fs.readFileSync(configSrcPath);
	fs.writeFileSync(configDestPath, configStr);

	let pgkSrcPath = path.join(__dirname, '../template/package.json'),
		pkgDestPath = path.resolve('package.json');
	if (fs.existsSync(pkgDestPath)) {
		throw new Warning.FileExistErr("package.json");
	}

	let pgkStr = fs.readFileSync(pgkSrcPath);
	fs.writeFileSync(pkgDestPath, pgkStr);


	Logger.log('steamer.config.js and package.json are initiated');
}


module.exports = function() {
	initSteamerConfig();
};