#!/usr/bin/env node
"use strict";

const fs = require('fs'),
	  path = require('path'),
	  argv = require('yargs').argv,
	  exec = require('child_process').exec,
	  execSync = require('child_process').execSync,
	  _ = require('lodash');

const Warning = require('../libs/SteamerErrWarning'),
	  Logger = require('../libs/SteamerLogger'),
	  Get = require('../libs/SteamerGet');

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

/**
 * 安装node_modules包
 * @param  {[type]} paths           [description]
 * @param  {[type]} projects        [description]
 * @return {[type]}                 [description]
 */
function installPkg(paths, projects) {
	
	function runNpn(cwd, num) {
		// let nodeVer = (num < paths.length - 1) ? projectNodeVers[0] : steamerConfig.defaultNodeVersion,
		let currentProject = (num < paths.length - 1) ? projects[num] : 'main project';

		// let cmd = "nvm use " + nodeVer;
		// console.log(execSync(cmd));
		
		let cmd = "npm i";

		let childProcess = exec(cmd, {cwd}, function (error, stdout, stderr) {
			if (error !== null) {
				console.log(error);
			}
        });

        childProcess.stdout.on('data', function (data) {
        	Logger.log(currentProject + ": \n" + data);
        });

        childProcess.stderr.on('data', function (data) {
        	Logger.error(currentProject + ": \n" + data);
        });

        childProcess.on('exit', (code) => {
        	Logger.log(currentProject + ": \n" + 'child process exited with code ' + code);
        	if (num <= paths.length - 2) {
        		++num;
        		runNpn(paths[num], num);
        	} 
        });
	};

	runNpn(paths[0], 0);
}

/**
 * execute installation command
 * @return {[type]} [description]
 */
function execIntall() {
	let projects = Object.keys(projectConfig) || [],
		projectSrc = [];
		// projectNodeVers = [];
	
	projects.map((item, key) => {
		let project = projectConfig[item];
		
		if (!project.src) {
			throw new Warning.ProjectKeyMissing();
		}

		projectSrc.push(path.resolve(project.src));
		// projectNodeVers.push(project.node || defaultNodeVer);
	});

	let packageJson = {},
		mainPackageJson = {};

	projectSrc.map((item, key) => {
		let packageJsonPath = path.join(item, 'package.json');

		// if (!fs.existsSync(packageJsonPath)) {
		// 	throw new Warning.PackageJsonMissing(projects[key]);
		// }

		packageJson[key] = require(packageJsonPath);
	});

	mainPackageJson = require(path.resolve("package.json"));

	projectSrc.map((item, key) => {
		let diffDependencies = _.difference(_.keys(packageJson[key].dependencies), _.keys(mainPackageJson.dependencies)),
			diffDevDependencies =_.difference(_.keys(packageJson[key].devDependencies), _.keys(mainPackageJson.devDependencies));

		packageJson[key].dependenciesBk = packageJson[key].dependenciesBk || {},
		packageJson[key].devDependenciesBk = packageJson[key].devDependenciesBk || {};

		packageJson[key].dependenciesBk = _.merge(packageJson[key].dependenciesBk, packageJson[key].dependencies);
		packageJson[key].devDependenciesBk = _.merge(packageJson[key].devDependenciesBk, packageJson[key].devDependencies);
		
		diffDependencies.map((item, index) => {
			let nm = mainPackageJson.dependencies[item];

			if (!nm) {
				mainPackageJson.dependencies[item] = packageJson[key].dependencies[item];
				delete packageJson[key].dependencies[item];
			}
		});

		diffDevDependencies.map((item, index) => {
			let nm = mainPackageJson.devDependencies[item];

			if (!nm) {
				mainPackageJson.devDependencies[item] = packageJson[key].devDependencies[item];
				delete packageJson[key].devDependencies[item];
			}
		});

		_.keys(mainPackageJson.dependencies).map((item, index) => {
			let nm = mainPackageJson.dependencies[item];

			if (!nm || nm && nm === packageJson[key].dependencies[item]) {
				delete packageJson[key].dependencies[item];
			}
		});

		_.keys(mainPackageJson.devDependencies).map((item, index) => {
			let nm = mainPackageJson.devDependencies[item];

			if (!nm || nm && nm === packageJson[key].devDependencies[item]) {
				delete packageJson[key].devDependencies[item];
			}
		});
		
		let packageJsonPath = path.join(item, 'package.json');
		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson[key], null, 4));
	});
	
	fs.writeFileSync(path.resolve("package.json"), JSON.stringify(mainPackageJson, null, 4));

	let combinePaths = _.merge(projectSrc, []);
	combinePaths.push(path.resolve());
	installPkg(combinePaths, projects);
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
		execIntall();
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

