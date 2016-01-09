var fs = require('fs');

var faker = require('faker');
var _ = require('underscore');

// generate score names to recommend
var scores = _.times(faker.random.number({min: 5, max: 10}), function(n){
	// return { title: faker.hacker.ingverb() };
	return faker.hacker.ingverb();
});

var scoresStringified = JSON.stringify(scores);

fs.writeFileSync('data/scores.json', scoresStringified);

console.log('%s score generated', _.size(scores));
// console.log(scoresStringified, '\n');


// generate people which will set different scores
var people = _.times(faker.random.number({min: 10, max: 20}), function(n){
	return { name: faker.name.findName() }; 	
	// return faker.name.findName(); 
});

var peopleStringified = JSON.stringify(people);

fs.writeFileSync('data/people.json', JSON.stringify(people));

console.log('%s people generated', _.size(people));
// console.log(peopleStringified, '\n');

// function to generate random scores
function randomScores() {
	var randScores = _.first(_.shuffle(scores), faker.random.number({min: 2, max: 4}));
	return _.map(randScores, function(randScore){
		var score = {};
		score[randScore] = faker.random.number(5);
		return score;
	});  
}

// generate random scores from each person
var critics = _.map(people, function(unit) {
	unit.scores = randomScores();
	return unit;
});

var criticsStringified = JSON.stringify(critics);
fs.writeFileSync('data/critics.json', criticsStringified);

console.log('%s critics generated', _.size(critics));
// console.log(criticsStringified, '\n');
