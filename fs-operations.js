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

var verifyPath = function(path) {
	return executeCommand('cd ' + path);
};

var makeDestinationDir = function(path) {
	console.log('making dir ' + path)
	return executeCommand('mkdir ' + path)
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
	return executeCommand('md5sum ' + path).then(function(output) {
		return Promise.resolve(output.split(' ')[0]);
	}, function(err) { return Promise.reject(err); });
};

var makeSymLink = function(linkPath, filePath) {
	console.log(filePath + ": creating symlink at " + linkPath)
	return executeCommand('ln -s ' + filePath + ' '  + linkPath);
}

var copyFile = function(source, destination) {
	console.log(source + ": copying to " + destination)
	return executeCommand('cp ' + destination + ' '  + destination)
	.catch(function(err) {
		if (null !== /No such file or directory/.exec(err)) return executeCommand('cp ' + source + ' '  + destination);
		else return Promise.reject("Attempted to cp over existing file: " + destination);
	})
}

var lockDir = function(path) {
	return executeCommand('chmod 555 ' + path + ' -R');
}

module.exports = {
	verifyPath : verifyPath,
	makeDestinationDir : makeDestinationDir,
	getDirContents : getDirContents,
	trimPath : trimPath,
	absolutifyPath : absolutifyPath,
	getMD5Sum : getMD5Sum,
	makeSymLink : makeSymLink,
	copyFile : copyFile,
	lockDir : lockDir
}
