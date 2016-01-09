var fs = require('fs');
var path = require('path');

var _ = require('underscore');

function readFile(filename) {
	var fullpath = path.join(__dirname, './data', filename + '.json');
	var buff = fs.readFileSync(fullpath);
	var data = buff.toString();
	return JSON.parse(data);
}

function similarDistance(commonScores) {
	var sum = 0;

	if (!_.size(commonScores)) {
		return 0;
	}

	_.each(commonScores, function(scores){
		var keys = Object.keys(scores);
		var p1value = _.toArray(scores[keys[0]])[0];
		var p2value = _.toArray(scores[keys[1]])[0];
		sum += Math.pow(Math.abs(p1value - p2value), 2);
	});

	var sqrtSum = Math.sqrt(sum);
	var endSum = 1 / ( 1 + sqrtSum );

	return endSum;
}

function commonScores(critics, person1, person2) {

	// find person 1 critic
	var person1critic = _.find(critics, function (critic) {
		return critic.name == person1.name;
	});

	// find person 2 critic
	var person2critic = _.find(critics, function (critic) {
		return critic.name == person2.name;
	});

	// find common scores between persons
	var commonScores = _.map(person1critic.scores, function (p1score) {
		var key1 = Object.keys(p1score)[0];
		var person2sameScore = _.first(_.filter(person2critic.scores, function (p2score) {
			var key2 = Object.keys(p2score)[0];
			return key1 === key2;
		}));
		return (person2sameScore) ? [p1score, person2sameScore] : false; 
	})

	// filter falsy values
	return _.compact(commonScores);
}

var people = readFile('people');
var critics = readFile('critics');

var twoRandPeople = _.first(_.shuffle(people), 2);
console.log('\n Two random people:');
console.log(twoRandPeople);

var peopleCommonScores = commonScores(critics, twoRandPeople[0], twoRandPeople[1]);
console.log('\n Common scores between people:');
console.log(peopleCommonScores);

var similarityCoefficient = similarDistance(peopleCommonScores);
console.log('\n Similarity Coefficient:', similarityCoefficient);