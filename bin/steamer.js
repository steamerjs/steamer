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
	  Install = require('../libs/SteamerInstall');

var steamerConfigPath = path.resolve('steamer.config.js'),
	steamerConfig = {},
	projectConfig = {},
	// defaultNodeVer = {},
	emptyFunc = function() {};

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
/**
 * execute commands for development and publishment
 * @return {[type]} [description]
 */
function execDevOrPub() {

	let cmdType = (argv.dev) ? 'dev' : 'pub';

	let projects = Object.keys(projectConfig) || [],
		projectSrc = [],
		projectCmds = [];
		// projectNodeVers = [];
	
	projects.map((item, key) => {
		let project = projectConfig[item];
		
		if (!project.src || !project.cmds || !project.cmds.hasOwnProperty(cmdType)) {
			throw new Warning.ProjectKeyMissing();
		}

		projectSrc.push(path.resolve(project.src));
		projectCmds.push(project.cmds[cmdType]);
		// projectNodeVers.push(project.node || defaultNodeVer);
	});


	let tmpConfig = {},
		processCount = 0; // 线程计数器
	// closure funciton to keep steamerConfig state
	function runningProcess(steamerConfig, opt, cb) {
		let cmd = opt.cmd,
			key = opt.key,
			cwd = opt.cwd;

		return function() {

			let childProcess = exec(cmd, {cwd}, function (error, stdout, stderr) {

	        });

	        tmpConfig[childProcess.pid] = _.merge({
	        	currentProject: projects[key],
				// currentNodeVer: projectNodeVers[key]
	        }, steamerConfig);
	        
	        if (steamerConfig.steps && steamerConfig.steps[cmdType]) {
				let stepStart = steamerConfig.steps[cmdType].start || emptyFunc;
				stepStart(tmpConfig[childProcess.pid]);
			}

	        childProcess.stdout.on('data', function (data) {
	        	Logger.log(projects[key] + ': \n' + data);
	          });

	        childProcess.stderr.on('data', function (data) {
	        	Logger.error(projects[key] + ': \n' + data);
	        });

	        childProcess.on('exit', (code) => {
	        	// 统计是否全部线程都已结束
	        	processCount++;
	        	tmpConfig[childProcess.pid].isEnd = (processCount === projects.length) ? true : false;

	        	// keep config state
	        	cb(tmpConfig[childProcess.pid]);
	        	Logger.log(projects[key] + ': \n' + 'child process exited with code ' + code);
	
	        });
		}
	}

	projectSrc.map((cwd, key) => {
		// 命令拼接
		
		// let cmd = 'nvm use ' + projectNodeVers[key];
		// execSync(cmd);
		
		let cmd = projectCmds[key];

		// 传入回调的config数据
		steamerConfig = _.merge(steamerConfig, {
			currentProject: projects[key],
			// currentNodeVer: projectNodeVers[key]
		});

		let stepFinish = emptyFunc;
		if (steamerConfig.steps && steamerConfig.steps[cmdType]) {
			stepFinish = steamerConfig.steps[cmdType].finish || emptyFunc;
		}

		runningProcess(steamerConfig, {
			cmd,
			key,
			cwd,
		}, stepFinish)();
	});

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
		execDevOrPub();
	}
	else if (argv.install) {
		Install(steamerConfig);
	}
	else if (argv.get) {
		Get(argv);
	}
	else if (argv.init) {

	}
	else {
		throw new Warning.Command();
	}
}

init();

