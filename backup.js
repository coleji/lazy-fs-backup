var fs = require('fs');

function flattenArray(arr) {
	return arr.reduce(function(result, e) {
		if (e instanceof Array) result.push(flattenArray(e));
		else result.push(e);
		return result;
 	}, []);
};

function backupFile(sourcePath, recurseSubPath, file) {
	return new Promise(function(resolve, reject) {
		console.log(sourcePath + '/' + recurseSubPath + '/' +  file + ": is a file!  back it up!");
		setInterval(resolve, 5000)
	})
}

function recurse(sourcePath, recurseSubPath) {
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
						if (stats.isSymbolicLink()) resolve();
						else if (stats.isDirectory()) {
							recurse(sourcePath, recurseSubPath + '/' + file).then(function(subPromise){
								resolve(subPromise);
							}, function(err) {
								console.log(err);
								reject(err);
							});
						} else if (stats.isFile()) {
							backupFile(sourcePath, recurseSubPath, file).then(function(err) {
								console.log(sourcePath + '/' + recurseSubPath + '/' + file + " : finished backup")
								resolve();
							}, function(err) {
								console.log(err);
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
	}).catch(function(err) {
		console.log(err)
	});
}

var doBackup = function(sourcePath, destinationContainer, dates) {
	return recurse(sourcePath, '.');
};

module.exports = doBackup;
