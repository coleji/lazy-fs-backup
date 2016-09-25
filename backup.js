var fs = require('fs');

function flattenArray(arr) {
	return arr.reduce(function(result, e) {
		if (e instanceof Array) result.push(flattenArray(e));
		else result.push(e);
		return result;
 	}, []);
};

function backupFile(file, callback) {
	console.log("***********  " + file + " is a file!  back it up!");
	callback();
}

function recurse(sourcePath, recurseSubPath) {
	return new Promise(function(resolve, reject) {
		console.log("recursing through source path: " + sourcePath + " subpath: " + recurseSubPath)
		console.log("about to readdir: " + sourcePath + '/' + recurseSubPath)
		fs.readdir(sourcePath + '/' + recurseSubPath, function(err, files) {
			if (err) reject(err);
			else resolve(files);
		})
	}).then(function(files) {
		return Promise.all(files.map(function(file) {
			return new Promise(function(resolve, reject) {
				console.log('about to lstat ' + sourcePath + '/' + recurseSubPath + '/' + file)
				fs.lstat(sourcePath + '/' + recurseSubPath + '/' + file, function(err, stats) {
					console.log("found a thing: " + file)
					if (err) reject(err);
					else {
						if (stats.isSymbolicLink()) resolve();
						else if (stats.isDirectory()) {
							Promise.all(recurse(sourcePath, recurseSubPath + '/' + file)).then(function(promises){
								resolve(promises);
							}, function(err) {
								reject(err);
							})
						} else if (stats.isFile()) backupFile(file, function(err) {
							if (err) reject(err);
							else resolve();
						});
						else console.log(file + " is nothing i care about")
						resolve();
					}
				});
			});
		}));
	}).catch(function(err) {
		console.log(err)
	});
}

var doBackup = function(sourcePath, destinationContainer, dates) {
	return Promise.all(flattenArray(recurse(sourcePath, '.')));
};

module.exports = doBackup;
