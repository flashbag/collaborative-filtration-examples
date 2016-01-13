var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');
var faker = require('faker');

var _ = require('underscore');

var dataDir = path.join(__dirname, './data');

// get rand float score from 0..5
function getRandScore() {
	return parseFloat((faker.random.number(5) + Math.random()).toFixed(3) );
}

// function to generate random person scores for items
function personRandomScores(itemsArray) {
	var randItems = _.first(
		_.shuffle(itemsArray), faker.random.number({min: 3, max: 5})
	);
	return _.map(randItems, function (randItem) {
		var item = _.clone(randItem);
		item.score = getRandScore();
		return item;
	});  
}

// get person score by id
function getPersonScores(personId, peopleScores) {
	return _.flatten(_.map(_.filter(peopleScores, 
		function filterIt(somePersonScore) {
		return somePersonScore.person_id === personId;
	}), function mapIt(scoreRecord) {
		// console.log(scoreRecord);
		return scoreRecord.scores;
	}));
}

// passs error with optional callback
function passError(err, callback) {
	if (err) {
		debugger;
		if (typeof callback === 'function') {
			return callback(err);
		} else if (_.isError(err)) {
			throw err;
		} else {
			console.error(err);
			return false;	
		}
	}
}

// scopes generators
var generators = {

	// source entity
	items: function () {
	
		var randomUniqTitles = _.uniq(_.times(faker.random.number({min: 10, max: 20}), function (n) {
			return faker.hacker.ingverb();
		}));
		
		return _.map(randomUniqTitles, function (uniqTitle, index) {
			return { 
				item_id: index,
				title: uniqTitle
			};
		})
	},

	// source entity
	people: function () {
		// generate people which will be rate different items and producting scores
		return _.times(faker.random.number({min: 10, max: 20}), function (n) {
			return { 
				person_id: n,
				name: faker.name.findName() 
			}; 	
		});
	},

	// output entity
	peopleScores: function (data) {
		// generate random scores from each person
		return _.map(data.people, function(unit) {
			unit.scores = personRandomScores(data.items);
			return unit;
		});
	}

};

exports.saveScope = function (scope, data, callback) {

	var dataStringified = JSON.stringify(data);

	fs.writeFile(dataDir + '/' + scope + '.json', dataStringified, function(err){
		if (err) return callback(err);

		// console.log('%s items generated', _.size(data));
		// console.log(dataStringified, '\n');
		callback(null, data);
	});
};

exports.readScope = function (scope, callback) {

	var fullpath = path.join(dataDir, scope + '.json');

	async.waterfall([
		function (cb) {
			fs.stat(fullpath, function (err, stat) {
				if (err) {
					return callback(null, false);
				}
				cb(err, stat);
			});
		},
		function (stat, cb) {
			fs.readFile(fullpath, { encoding: 'utf-8' }, cb);
		},
		function (json, cb) {
			try {
			    cb(null, JSON.parse(json));
			}
			catch(err) {
				cb(err);
			}
		},
		], callback);	
};

exports.commonPersonsScores = function (persons, peopleScores) {

	if (!persons.length) {
		throw new TypeError('persons array is invalid or empty');
	} 

	if (persons.length < 2) {
		throw new TypeError('need to pass two persons');	
	}
	
	var firstPerson = {
		person: persons[0],
		scores: getPersonScores(persons[0].person_id, peopleScores)
	};

	var secondPerson = {
		person: persons[1],
		scores: getPersonScores(persons[1].person_id, peopleScores)
	};
	
	var commonScores = _.map(firstPerson.scores, function (firstScore) {
		var secondPersonMatchedScore = _.first(_.filter(secondPerson.scores, function (secondScore) {
			return firstScore.item_id === secondScore.item_id;
		}));
		// console.log(firstScore);
		// console.log(secondPersonMatchedScore);
		if (firstScore && secondPersonMatchedScore) {
			return [
				firstScore,
				secondPersonMatchedScore
			];
		}
		return false;
	});

	// filter falsy values
	return _.compact(commonScores);
};

exports.getData = function(callback) {

	var parallelRead = {
		items: function (cb) {
			exports.readScope('items', cb);
		},
		people: function (cb) {
			exports.readScope('people', cb);
		}
	};

	var parallelCreate = {
		items: function (cb) {
			exports.saveScope('items', generators.items(), cb);
		},
		people: function (cb) {
			exports.saveScope('people', generators.people(), cb);
		},
	};

	async.waterfall([
		function (cb) {
			// async.parallel(parallelRead, cb);
			async.parallel(parallelRead, function (err, readedData) {
				// console.log('\n readedData:');
				// console.log(readedData);
				cb(err, readedData);
			});
		},
		// readedData  = { items: [ ... ], people: false }
		function (readedData, cb) {
			if (!readedData.items || !readedData.people) {
				// return async.parallel(parallelRead, cb);
				async.parallel(parallelCreate, function (err, createdData) {
					// console.log('\n createdData:');
					// console.log(readedData);
					return cb(null, createdData)
				});
			} else {
				return cb(null, readedData);
			}
		},
		// data  = { scores: [ ... ], people: [ ... ] }
		function (data, cb) { 
			async.waterfall([
				// read criticts
				function (cb) {
					exports.readScope('people-scores', cb);
				},
				// generate if not exists
				function (readedCritics, cb) {
					if (!readedCritics) {
						return exports.saveScope('people-scores', generators.peopleScores(data), cb);
					} else {
						cb(null, readedCritics);
					}
				},
			], function (err, peopleScores) {
				if (err) {
					return cb(err);
				} 
				cb(null, _.extend(data, { peopleScores: peopleScores}));
			});
		},
	], function (err, data) {
	
		if (err) return passError(err, callback);

		// data  = { scores: [ ... ], people: [ ... ], peopleScores: [ ... ] }
		callback(null, data);
	});
};