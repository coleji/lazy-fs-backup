const exec = require('child_process').exec;
const fs = require('fs');

function executeCommand(cmd) {
	return new Promise(function(resolve, reject) {
		exec(cmd, function(err, stdout, stderr) {
			if (err) reject(err);
			else resolve(stdout);
		})
	})
}

function quotePath(path) {
	return '\'' + path.replace(/\'/g, '\'\\\'\'') + '\'';
}

var verifyPath = function(path) {
	return executeCommand('cd ' + quotePath(path));
};

var getDirContents = function(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(path, function(err, files) {
			if (err) reject(err);
			else resolve(files);
		})
	});
};

var trimPath = function(path) {
	if (path.substr(path.length - 1) == '/') return path.substr(0, path.length - 1);
	else return path;
};

var absolutifyPath = function(path) {
	if (path.substr(0,1) == '/') return path;
	else return __dirname + '/' + path;
};

var getMD5Sum = function(path) {
	return executeCommand('md5sum ' + quotePath(path)).then(function(output) {
		return Promise.resolve(output.split(' ')[0]);
	}, function(err) { return Promise.reject(err); });
};

// DRYRUNNABLE FUNCTIONS

var makeDestinationDir = function(dryrunMode) {
	return function(path) {
		console.log('making dir ' + path)
		if (dryrunMode) return Promise.resolve();
		else return executeCommand('mkdir ' + quotePath(path));
	};
};

var makeSymLink = function(dryrunMode) {
	return function(linkPath, filePath) {
		console.log(filePath + ": creating symlink at " + linkPath)
		if (dryrunMode) return Promise.resolve();
		else return executeCommand('ln -s ' + quotePath(filePath) + ' '  + quotePath(linkPath));
	}
};

var copyFile = function(dryrunMode) {
	return function(source, destination) {
		console.log(source + ": copying to " + destination)
		if (dryrunMode) return Promise.resolve();
		else return executeCommand('cp ' + quotePath(destination) + ' '  + quotePath(destination))
		.catch(function(err) {
			if (null !== /No such file or directory/.exec(err)) return executeCommand('cp ' + quotePath(source) + ' '  + quotePath(destination));
			else return Promise.reject("Attempted to cp over existing file: " + destination);
		})
	}
};

var lockDir = function(dryrunMode) {
	return function(path) {
		if (dryrunMode) return Promise.resolve();
		else return executeCommand('chmod 555 ' + quotePath(path) + ' -R');
	}
};

module.exports = function(dryrunMode) {
	return {
		verifyPath : verifyPath,
		getDirContents : getDirContents,
		trimPath : trimPath,
		absolutifyPath : absolutifyPath,
		getMD5Sum : getMD5Sum,

		makeDestinationDir : makeDestinationDir(dryrunMode),
		makeSymLink : makeSymLink(dryrunMode),
		copyFile : copyFile(dryrunMode),
		lockDir : lockDir(dryrunMode)
	}
}
