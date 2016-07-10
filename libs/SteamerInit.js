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
	let configSrcPath = path.resolve('../template/steamer.config.js'),
		configDestPath = path.resolve('steamer.config.js');
	if (fs.existsSync(configDestPath)) {
		throw new Warning.FileExistErr("steamer.config.js");
	}

	let configStr = fs.readFileSync(configSrcPath);
	fs.writeFileSync(configDestPath, configStr);
	Logger.log('steamer.config.js is initiated');
}


module.exports = function() {
	initSteamerConfig();
};