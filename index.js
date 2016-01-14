var async = require('async');
var _ = require('underscore');

var dataHelper = require('./data-helper');

var similarityCoefficient = require('./lib/similarity-coefficient.js');

dataHelper.getData(function(err, data) {
	
	if (err) {
		throw _.isError(err) ? err : new Error(err);
	}
	
	var twoRandPersons = _.first(_.shuffle(data.people), 2);
	console.log('\n Two random persons:');
	console.log(twoRandPersons);

	var personsCommonScores = dataHelper.commonPersonsScores(twoRandPersons, data.peopleScores);
	console.log('\n Common scores between persons:');
	console.log(personsCommonScores);

	console.log('\n Persons similarity coefficients \n');
	console.log('\t by euclideanDistance:', similarityCoefficient.euclideanDistance(personsCommonScores) );
	console.log('\t by pearson corelation:', similarityCoefficient.pearsonCorelation(personsCommonScores) );

	
	function printPersonTopMatches(personTopMatches) {
		_.each(personTopMatches, function (person) {
			// console.log('\t ' + person.name);
			// console.log('\t ' + person.relativeScore);
			console.log('\t', person.name, ' \t \t \t ', person.relativeScore);
		});
	}

	var topMatchesCount = 5;
	var firstPersonTopMatches1 = dataHelper.personTopMatches(twoRandPersons[0], data.people, topMatchesCount, data.peopleScores, similarityCoefficient.euclideanDistance);
	console.log('\n "' + twoRandPersons[0].name + '" similar people by euclideanDistance: \n');
	printPersonTopMatches(firstPersonTopMatches1);

	var firstPersonTopMatches2 = dataHelper.personTopMatches(twoRandPersons[0], data.people, topMatchesCount, data.peopleScores, similarityCoefficient.pearsonCorelation);
	console.log('\n "' + twoRandPersons[0].name + '" similar people by pearson corelation: \n');
	printPersonTopMatches(firstPersonTopMatches2);
});