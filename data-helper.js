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
	var randItems = _.first(_.shuffle(itemsArray), faker.random.number({min: 3, max: 6}));
	return _.map(randItems, function (randItem) {
		var item = _.clone(randItem);
		item.score = getRandScore();
		return item;
	});  
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

function saveScope(scope, data, callback) {

	var dataStringified = JSON.stringify(data);

	fs.writeFile(dataDir + '/' + scope + '.json', dataStringified, function(err){
		if (err) return callback(err);

		// console.log('%s items generated', _.size(data));
		// console.log(dataStringified, '\n');
		callback(null, data);
	});
};

function readScope(scope, callback) {

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

// scopes generators
var generators = {

	// source entity
	items: function () {
	
		var randomUniqTitles = _.uniq(_.times(faker.random.number({min: 10, max: 20}), function (n) {
			return faker.hacker.ingverb();
		}));
		
		return _.map(randomUniqTitles, function (uniqTitle, index) {
			return { item_id: index, title: uniqTitle };
		});
	},

	// source entity
	people: function () {

		var randomUniqNames = _.uniq(_.times(faker.random.number({min: 7, max: 14}), function (n) {
			return faker.name.findName() ;
		}));

		// generate people which will be rate different items and producting scores
		return _.map(randomUniqNames, function (uniqName, index) {
			return { person_id: index, name: uniqName };
		})
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

exports.getData = function(callback) {

	var parallelRead = {
		items: function (cb) {
			readScope('items', cb);
		},
		people: function (cb) {
			readScope('people', cb);
		}
	};

	var parallelCreate = {
		items: function (cb) {
			saveScope('items', generators.items(), cb);
		},
		people: function (cb) {
			saveScope('people', generators.people(), cb);
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
					readScope('people-scores', cb);
				},
				// generate if not exists
				function (readedCritics, cb) {
					if (!readedCritics) {
						return saveScope('people-scores', generators.peopleScores(data), cb);
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


// PERSONS FUNCTIONS

// two persons common scores
exports.commonPersonsScores = function (persons, peopleScores) {

	if (!persons.length) {
		throw new TypeError('persons array is invalid or empty');
	} 

	if (persons.length < 2) {
		throw new TypeError('need to pass two persons');	
	}
	
	var firstPerson = {
		person: persons[0],
		scores: exports.getPersonScores(persons[0].person_id, peopleScores)
	};

	var secondPerson = {
		person: persons[1],
		scores: exports.getPersonScores(persons[1].person_id, peopleScores)
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

// person top matches
exports.personTopMatches = function (person, people, n, peopleScores, simCoeffFunction) {
	var personWithPeopleScores = _.map(people, function (otherPerson) {
		if (otherPerson.name === person.name) {
			return false;
		}
		var personWithScore = _.clone(otherPerson);
		var commonScores = exports.commonPersonsScores(
			[person, otherPerson],
			peopleScores
		)
		personWithScore.relativeScore = simCoeffFunction(commonScores);
		// console.log('relativeScore:', personWithScore.relativeScore);
		return personWithScore;
	});

	var sorted = _.sortBy(_.compact(personWithPeopleScores), function (p) { 
		return p.relativeScore; 
	}); 

	return _.last(sorted, n).reverse();
};

// get person score by id
exports.getPersonScores = function(personId, peopleScores) {
	return _.flatten(_.map(_.filter(peopleScores, 
		function filterIt(somePersonScore) {
		return somePersonScore.person_id === personId;
	}), function mapIt(scoreRecord) {
		// console.log(scoreRecord);
		return scoreRecord.scores;
	}));
};