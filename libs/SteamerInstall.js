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
	  Logger = require('../libs/SteamerLogger');

var steamerConfig = {},
	projectConfig = {};

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
		 
		let pkgJsonPath = path.join(cwd, 'package.json'),
			pgkJsonConfig = {};

		if (fs.existsSync(pkgJsonPath)) {
			pgkJsonConfig = require(pkgJsonPath);
		}
		
		npm.load(pkgJsonPath, function (er) {

			if (er) {
				Logger.error(currentProject + ": \n" + er);
				return;
			}
			
		  	npm.commands.install([], function (er, data) {
		    	if (er){
		    		Logger.error(currentProject + ": \n" + er);
		    	}
		    	else {
		    		Logger.log(currentProject + ": \n" + data);
		    	}

		    	if (num <= paths.length - 2) {
	        		++num;
	        		runNpn(paths[num], num);
	        	} 
		    	
		  	});
		});

	};

	// console.log(paths);
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

		if (!fs.existsSync(packageJsonPath)) {
			throw new Warning.PackageJsonMissing(projects[key]);
		}

		packageJson[key] = require(packageJsonPath);
	});

	mainPackageJson = require(path.resolve("package.json"));

	// main project gets value of dependencies and devDependencies from subprojects
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

module.exports = function(steamerConfig) {
	steamerConfig = steamerConfig;
	projectConfig = steamerConfig.projects;

	execIntall();
};