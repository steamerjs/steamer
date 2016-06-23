#!/usr/bin/env node
"use strict";

const fs = require('fs'),
	  path = require('path'),
	  argv = require('yargs').argv,
	  exec = require('child_process').exec,
	  execSync = require('child_process').execSync,
	  _ = require('lodash'),
	  requireg = require('requireg'),
	  npm = requireg('npm');

const Warning = require('../libs/SteamerErrWarning'),
	  Logger = require('../libs/SteamerLogger'),
	  Get = require('../libs/SteamerGet'),
	  Install = require('../libs/SteamerInstall'),
	  DevOrPub = require('../libs/SteamerDevOrPub');

var steamerConfigPath = path.resolve('steamer.config.js'),
	steamerConfig = {},
	projectConfig = {};
	// defaultNodeVer = {},

/**
 * read config file
 * @return {[type]} [description]
 */
function readConfig() {
	let config = null;
	if (!fs.existsSync(steamerConfigPath)) {
		throw new Warning.ConfigMissing();
	}

	config = require(steamerConfigPath);

	if (!config) {
		throw new Warning.ConfigMissing();
	}

	return config;
}


function init() {

	if (argv.init) {
		// avoid overriding
		let configSrcPath = "./node_modules/steamer/template/steamer.config.js",
			configDestPath = path.resolve('steamer.config.js');
		if (fs.existsSync(configDestPath)) {
			throw new Warning.FileExistErr("steamer.config.js");
		}

		let configStr = fs.readFileSync(configSrcPath);
		fs.writeFileSync(configDestPath, configStr);
		Logger.log('steamer.config.js is initiated');
	}

	steamerConfig = readConfig();
	projectConfig = steamerConfig.projects;
	// defaultNodeVer = steamerConfig.defaultNodeVersion;

	if (!projectConfig) {
		throw new Warning.ProjectMissing();
	}

	// if (!defaultNodeVer) {
	// 	throw new Warning.NodeVerMissing();
	// }

	if (argv.dev || argv.pub) {
		DevOrPub(steamerConfig);
	}
	else if (argv.install) {
		Install(steamerConfig);
	}
	else if (argv.get) {
		Get(steamerConfig);
	}
	else if (argv.init) {

	}
	else {
		throw new Warning.Command();
	}
}

init();

