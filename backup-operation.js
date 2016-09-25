var fs = require('fs');

var fsOperations = require('./fs-operations')
var operateFile = require('./backup-file')

function flattenArray(arr) {
	return arr.reduce(function(result, e) {
		if (e instanceof Array) result.push(flattenArray(e));
		else result.push(e);
		return result;
 	}, []);
};

function recurse(dates, sourcePath, recurseSubPath, destinationContainer) {
	return new Promise(function(resolve, reject) {
		console.log(sourcePath + '/' + recurseSubPath + " : starting recurse, about to readdir")
		fs.readdir(sourcePath + '/' + recurseSubPath, function(err, files) {
			if (err){
				console.log(err);
				reject(err);
			} else resolve(files);
		})
	}).then(function(files) {
		return Promise.all(files.map(function(file) {
			return new Promise(function(resolve, reject) {
				console.log(sourcePath + '/' + recurseSubPath + " : about to lstat " + file)
				fs.lstat(sourcePath + '/' + recurseSubPath + '/' + file, function(err, stats) {
					if (err) {
						console.log(err);
						reject(err);
					} else {
						if (stats.isSymbolicLink()) {
							console.log(sourcePath + '/' + recurseSubPath + '/' + file + " resolved")
							resolve();
						} else if (stats.isDirectory()) {
							fsOperations.makeDestinationDir([destinationContainer, dates[0], recurseSubPath, file].join('/'))
							recurse(dates, sourcePath, recurseSubPath + '/' + file, destinationContainer).then(function(){
								console.log(sourcePath + '/' + recurseSubPath + '/' + file + " resolved")
								resolve();
							}, function(err) {
								console.log('%%%%%%%%%%%%%%%%%%%%' + err);
								reject(err);
							});
						} else if (stats.isFile()) {
							operateFile(sourcePath, recurseSubPath, file, destinationContainer, dates).then(function(err) {
								console.log(sourcePath + '/' + recurseSubPath + '/' + file + " : finished backup")
								console.log(sourcePath + '/' + recurseSubPath + '/' + file + " resolved")
								resolve();
							}, function(err) {
								console.log("!@!@!@!@" + err);
								reject(err)
							});
						} else {
							console.log("%%%%%%%%%%%%%%%% " + file + " is nothing i care about")
							resolve();
						}
					}
				});
			});
		}));
	});
}

var doBackup = function(sourcePath, destinationContainer, dates) {
	return recurse(dates, sourcePath, '.', destinationContainer).then(function() {
		return fsOperations.lockDir(destinationContainer + '/' + dates[0])
	});
};

module.exports = doBackup;
