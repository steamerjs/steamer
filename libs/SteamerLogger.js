var colors = require('colors');

module.exports = {
	log: function(msg) {
		console.log(msg['green']);
	},
	error: function(msg) {
		console.log(msg['red']);
	}
};