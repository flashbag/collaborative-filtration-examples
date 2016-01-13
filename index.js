var async = require('async');
var _ = require('underscore');

var dataHelper = require('./data-helper');

var similarityCoefficient = require('./lib/similarity-coefficient.js');

dataHelper.getData(function(err, data) {
	
	if (err) {
		throw _.isError(err) ? err : new Error(err);
	}
	
	// console.log(data.items);
	// console.log(data.people);
	// console.log(data.peopleScores);

	var twoRandPersons = _.first(_.shuffle(data.people), 2);
	console.log('\n Two random persons:');
	console.log(twoRandPersons);

	var personsCommonScores = dataHelper.commonPersonsScores(twoRandPersons, data.peopleScores);
	console.log('\n Common scores between persons:');
	console.log(personsCommonScores);

	console.log('\n Persons similarity coefficients \n');
	console.log('\t by euclideanDistance:', similarityCoefficient.euclideanDistance(personsCommonScores) );
	console.log('\t by pearson corelation:', similarityCoefficient.pearsonCorelation(personsCommonScores) );


	// var simCoeffEuclideanDistance = euclideanDistance(peopleCommonScores);
	// console.log('\n Similarity Coefficient:', similarityCoefficient);
});
// throw _.isError(err) ? err : new Error(err);