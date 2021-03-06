var moment = require('moment')

var dryrunMode = !!process.argv[4]
var fsOperations = require('./fs-operations')(dryrunMode)
console.log("Dryrun mode engaged? " + dryrunMode)

var doBackup = require('./backup-operation')

const FILE_NAME_FORMAT = 'YYYY-MM-DD';

var sourcePath = fsOperations.absolutifyPath(fsOperations.trimPath(process.argv[2]));
var destinationContainer = fsOperations.absolutifyPath(fsOperations.trimPath(process.argv[3]));


var today = moment().format(FILE_NAME_FORMAT);
var destinationPath = destinationContainer + '/' + today;

var canCleanupDestination = false;

new Promise(function(resolve, reject) {
	if (process.argv.length < 4) {
		reject("Call this script with two arguments, source path and backup destination path.");
	} else resolve();
}).then(function() {
	// Verify source path exists
	return fsOperations.verifyPath(sourcePath);
}).then(function() {
	// attempt to mkdir the desired destination directory
	return fsOperations.makeDestinationDir(destinationPath);
}).then(function() {
	// If we make it here then we successfully created the destination directory,
	// so if we crash after this point we can safely clean it up
	canCleanupDestination = true;

	// get a list of all the backups that have been done
	return fsOperations.getDirContents(destinationContainer)
}).then(function(files) {
	// Confirm that all the directories in destinationContainer are valid dates
	return new Promise(function(resolve, reject) {
		var dates = files.map(function(f) {
			if (moment(f).isValid()) return moment(f);
			else {
				reject("bad date: " + f);
				return null;
			}
		}).sort(function(a, b) {
			return b - a;
		}).map(function(d){ return d.format(FILE_NAME_FORMAT); });
		if (dryrunMode) dates.unshift(today)
		if (dates[0] == today) resolve(dates);
		else reject('Something\'s up with the directories in destinationContainer...');
	})
}).then(function(dates) {
	return doBackup(sourcePath, destinationContainer, dates);
}).then(function() {
	console.log("Backup success!");
}).catch(function(e) {
	console.log("Failure: " + e)
//	if (canCleanupDestination) return fsOperations.deleteDir(destinationPath)
})
