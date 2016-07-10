"use strict";
/**
 * remove projects
 * by heyli 2016.06.23
 */

const fs = require('fs-extra'),
	  path = require('path'),
	  argv = require('yargs').argv;

const Warning = require('../libs/SteamerErrWarning'),
	  Logger = require('../libs/SteamerLogger');

var steamerConfig = {},
	projectConfig = {};

function RemoveProject(project) {
	let folderPath = path.resolve(project);

	if (!fs.existsSync(folderPath)) {
		throw new Warning.FolderNotExistErr(folderPath);
	}

	Logger.log(project + " is being deleted");

	fs.removeSync(folderPath);

	let config = require(path.resolve('steamer.config.js'));

	if (config.projects.hasOwnProperty(project)) {
		delete config.projects[project];

		Object.keys(config.projects).map((item, index) => {
			if (!fs.existsSync(config.projects[item].src)) {
				delete config.projects[item];
			}
		});

		let configStr = 'var steamerConfig = ' + JSON.stringify(config, null, 4) 
					+ '\n ' + 'module.exports = steamerConfig;';
	
		fs.writeFileSync(path.resolve('steamer.config.js'), configStr);
	}

	Logger.log("remove project " + project + " success");
}

module.exports = function(steamerConfig) {
	steamerConfig = steamerConfig;
	projectConfig = steamerConfig.projects;

	RemoveProject(argv.remove);
};