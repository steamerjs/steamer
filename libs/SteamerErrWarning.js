/**
 * Error and Warning
 * by heyli 2016.06.23
 */

var colors = require('colors');

module.exports = {
	Command: function() {
		console.log("Please Input Appropriate Parameters".red);
	},
	ConfigMissing: function() {
		console.log("steamer.config.js is missing or steamer.config.js is empty".red);
	},
	ProjectKeyMissing: function() {
		console.log("you may miss one of the following keys: src, cmds, cmds.dev or cmds.pub".red);
	},
	ProjectMissing: function() {
		console.log("you may miss key project".red);
	},
	NodeVerMissing: function() {
		console.log("you may miss key defaultNodeVersion".red);
	},
	PackageJsonMissing: function(project) {
		console.log(("package.json in " + project + " project is missing").red);
	},
	FileExistErr: function(file) {
		console.log((file + " has existed").red);
	},
	FolderNotExistErr: function(folder) {
		console.log((folder + " has existed").red);
	},
	HasNoRepo: function(repo) {
		console.log(("steamer has no repo " + repo).red);
	},
};