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
	return executeCommand('cd ' + __dirname + '/' + path);
};

var makeDestinationDir = function(path) {
	return executeCommand('mkdir ' + __dirname + '/' + path)
}

var getDirContents = function(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(__dirname + '/' + path, function(err, files) {
			if (err) reject(err);
			else resolve(files);
		})
	});
}

// TODO: we should only be allowed to rm files that we created
// do not run this anywhere but a test server until this is done
var deleteDir = function(path) {
	console.log("about to rm -r " +  __dirname + '/' + path)
	return executeCommand('rm ' + __dirname + '/' + path + ' -r')
};

module.exports = {
	verifyPath : verifyPath,
	makeDestinationDir : makeDestinationDir,
	getDirContents : getDirContents,
	deleteDir : deleteDir
}
