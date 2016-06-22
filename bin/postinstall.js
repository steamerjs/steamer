const execSync = require('child_process').execSync,
	  os = require('os');


switch(os.type()) {
	case 'Darwin':
	case 'Linux':
		execSync('npm link');
		break;
	case 'Windows_NT':
		execSync('npm link');
		break;
}