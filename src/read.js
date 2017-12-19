'use strict';
// Load required libraries
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

	let from;
	if (Number(event.from) > 1) {
		console.log('Detecting from variable, ' + event.from);
		from = Number(event.from);
	} else {
		from = 1;
	}

	let to;
	if (Number(event.to) > 1) {
		console.log('Detecting to variable, ' + event.to);
		to = Number(event.to);
	} else {
		to = new Date() / 1000; // If to isn't present, default to current time
	}

	// Set scan limit to 20 if not present or greater than 20
	let limit = process.env.LIMIT;
	if (Number(event.limit) < process.env.LIMIT) {
		console.log('Detecting limit variable ' + event.limit);
		limit = event.limit;
	}

	console.log('Scanning from greater than ' + from);
	// Set scanning parameters
	let params = {
		TableName: 'impact-map',
		// Only get Coordinates and Action data from the table
		ProjectionExpression: 'Coordinates, #b',
		// Only return items that fall within start and stop parameters
		FilterExpression: 'Added BETWEEN :start AND :stop',
		ExpressionAttributeNames: {
			// Set an 'alias' for the word, 'Action', because 'Action' is a reserved word in DynamoDB
			'#b': 'Action'
		},
		ExpressionAttributeValues: {
			// Set an 'alias' for start and stop variables
			':start': from,
			':stop': to
		},
		Limit: limit
	};

	if (event.hasOwnProperty('exclusivestartkey') && event.exclusivestartkey !== '') {
		console.log('exclusivestartkey detected ' + event.exclusivestartkey);
		params.ExclusiveStartKey = {};
		params.ExclusiveStartKey.Id = event.exclusivestartkey;
	}

	console.log('Scanning table.');
	dynamodb.scan(params, onScan);

	function onScan(err, data) {
		// Log error if scanning returns err
		if (err) {
			console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
			callback(err);
		} else {
			// Continue scanning if we have more items, because scan can retrieve a maximum of 1MB of data
			if (data.hasOwnProperty('LastEvaluatedKey')) {
				console.log('LastEvaluatedKey detected');
			}

			// Returns the item data back to the client
			console.log('Returning ' + data.Items.Count + ' items to the client');
			callback(null, data);
		}
	}
};