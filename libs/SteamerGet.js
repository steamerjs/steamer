"use strict";

/**
 * Get Steamer Pgk
 * by heyli 2016.06.23
 */

const fs = require('fs'),
	  argv = require('yargs').argv,
	  exec = require('child_process').exec,
	  _ = require('lodash'),
	  Logger = require('./SteamerLogger'),
	  Warning = require('./SteamerErrWarning'),
	  path = require('path'),
	  Install = require('./SteamerInstall');

var repos = require('./SteamerRepos');


function updateConfig(repo, localName) {
	let config = require(path.resolve('steamer.config.js')),
		repoConfig = repos[repo].config;

	repoConfig.src = path.resolve(localName);
	config.projects[path.basename(localName)] = repoConfig;

	let configStr = 'var steamerConfig = ' + JSON.stringify(config, null, 4) 
					+ '\n ' + 'module.exports = steamerConfig;';
	
	fs.writeFileSync(path.resolve('steamer.config.js'), configStr);
}

module.exports = function(steamerConfig) {

	let repo = argv.get,
		localName = argv.name || argv.get;
	localName =	localName.replace('\\', '').replace('./', '').replace('.', '');

	if (steamerConfig.hasOwnProperty('repos')) {
		repos = _.merge(repos, steamerConfig.repos);
	}

	if (!repos.hasOwnProperty(repo)) {
		throw new Warning.HasNoRepo(repo);
	}

	let cmd = 'git clone --depth=1 --branch=master ' + repos[repo].git + ' ' + localName;

	let childProcess = exec(cmd, function (error, stdout, stderr) {});

	childProcess.stdout.on('data', function (data) {
    	Logger.log(': \n' + data);
      });

    childProcess.stderr.on('data', function (data) {
    	Logger.error(': \n' + data);
    });

    childProcess.on('exit', (code) => {
    	if (!code) {
    		Logger.log('clone ' + repo + ' success');
    		updateConfig(repo, localName);

    		Logger.log('npm install start...');
    		Install(steamerConfig);
    	}
    	else {
    		Logger.error('clone ' + repo + ' error');
    	}
    });

};