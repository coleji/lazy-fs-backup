var fsOperations = require('./fs-operations')

var operateFile = function(sourcePath, recurseSubPath, file, destinationContainer, dates) {
	console.log(sourcePath + '/' + recurseSubPath + '/' +  file + ": is a file!  back it up!");
	if (dates.length == 1) {
		// This is the first backup, no need for comparison
		return fsOperations.copyFile(
			[sourcePath, recurseSubPath, file].join('/'),
			[destinationContainer, dates[0], recurseSubPath, file].join('/')
		);
	} else {
		// compare to previous version
		var sourceSum, previousSum;

		return fsOperations.getMD5Sum([sourcePath, recurseSubPath, file].join('/'))
		.then(function(sum) {
			sourceSum = sum;
			return fsOperations.getMD5Sum([destinationContainer, dates[1], recurseSubPath, file].join('/'));
		}).then(function(sum) {
			previousSum = sum;
			if (sourceSum == previousSum) {
				console.log(sourceSum + ' == ' + previousSum + ", making symlink")
				return fsOperations.makeSymLink(
					[destinationContainer, dates[0], recurseSubPath, file].join('/'),
					[destinationContainer, dates[1], recurseSubPath, file].join('/')
				);
			} else {
				console.log(sourceSum + ' != ' + previousSum + ", copying file")
				return fsOperations.copyFile(
					[sourcePath, recurseSubPath, file].join('/'),
					[destinationContainer, dates[0], recurseSubPath, file].join('/')
				);
			}
		})
	}
};

module.exports = operateFile
