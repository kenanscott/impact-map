/*jshint esversion: 6 */
// Load required libraries
'use strict';
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();
const geoip = require('geoip-lite');
// Create a unique ID to describe this item in DynamoDB
function makeId() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < 64; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

exports.handler = (event, context, callback) => {
	// Look up the IP address of the client and get the coordinates
	const ip = event.sourceIP.split(',', 1)[0];
	console.log('Looking up IP ' + ip);
	const geo = geoip.lookup(ip);
	console.log('Location is ' + geo.ll);
	// Get ID for the item
	let id = makeId();
	// Set the current time and the time when the item should expire
	const currentTime = Math.floor(new Date());
	const currentTimePlusTwentyFourHours = (Math.floor(new Date())) + 86400;
	// Sets the parameters for writing to DynamoDB
	const params = {
		TableName: 'impact-map',
		Item: {
			'Id': id,
			'Added': currentTime,
			'Expire': currentTimePlusTwentyFourHours,
			'Coordinates': geo.ll,
			'Action': event.action
		},
	};

	// Creates the item
	dynamodb.put(params, function(err, data) {
		if (err) {
			console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2)); // Handles error in console.
			// Return an error message back to the user
			callback('Entry was not successful');
		} else {
			console.log('Added item:', JSON.stringify(data, null, 2));
			// Return a success message back to the client
			callback(null, 'Added item');
		}
	});
};
