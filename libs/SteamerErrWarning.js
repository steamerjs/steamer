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
	}
};