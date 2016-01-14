var _ = require('underscore');

var dataHelper = require('../data-helper');

exports.roundCoeff = function (coeff) {
	return parseFloat(coeff.toFixed(5));	
};

exports.euclideanDistance = function(commonScores) {

	var sum = 0;

	if (!_.size(commonScores)) {
		return 0;
	}

	_.each(commonScores, function (scores) {
		var score1 = scores[0].score;
		var score2 = scores[1].score;
		sum += Math.pow(Math.abs(score1 - score2), 2);
	});

	var sqrtSum = Math.sqrt(sum);
	var endSum = 1 / ( 1 + sqrtSum );

	return exports.roundCoeff(endSum);
};

exports.pearsonCorelation = function(commonScores) {

 	var commonScoresSize = _.size(commonScores);

	var person1scores = _.map(commonScores, function (score) {
		return score[0];
	});
	
	var person2scores = _.map(commonScores, function (score) {
		return score[1];
	});

	function reduceSumIterate(total, score) {
		return total + score.score; 	
	}

	function reduceSqIterate(total, score) {
		return total + Math.pow(score.score, 2); 	
	}

	var pSum = _.reduce(commonScores, function (total, scores) {
		return total + (scores[0].score * scores[1].score);
	}, 0);

	var person1sum = _.reduce(person1scores, reduceSumIterate, 0);
	var person2sum = _.reduce(person2scores, reduceSumIterate, 0);

	// console.log('\n');
	// console.log('person1sum: ', person1sum);
	// console.log('person2sum: ', person2sum);

	var person1sq = _.reduce(person1scores, reduceSqIterate, 0);
	var person2sq = _.reduce(person2scores, reduceSqIterate, 0);

	var num = pSum - (person1sum * person2sum / commonScoresSize);

	var den = Math.sqrt(
		(person1sq - Math.pow(person1sum, 2) / commonScoresSize) * 
		(person2sq - Math.pow(person2sum, 2) / commonScoresSize)
	);

	// console.log('num:', num);
	// console.log('den:', den);

	return (den === 0) ? 0 : exports.roundCoeff( num / den );
};

exports.jaccardIndex = function(twoRandPersons, peopleScores, commonScores) {

	var firstPerson = twoRandPersons[0];
	var secondPerson = twoRandPersons[1];
	
	var fScores = dataHelper.getPersonScores(firstPerson.person_id, peopleScores);
	var sScores = dataHelper.getPersonScores(secondPerson.person_id, peopleScores);

	var a = fScores.length;
	var b = sScores.length;

	var c = commonScores.length;

	return exports.roundCoeff(c / (a + b - c));
};
