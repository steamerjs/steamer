/**
 * Logger
 * by heyli 2016.06.23
 */

var colors = require('colors');

module.exports = {
	log: function(msg) {
		console.log(msg['green']);
	},
	error: function(msg) {
		console.log(msg['red']);
	}
};