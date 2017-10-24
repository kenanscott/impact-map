/*jshint esversion: 6 */
'use strict';
// Load required libraries
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();
const moment = require('moment-timezone');

exports.handler = (event, context, callback) => {

  console.log(event.startTime);

  // If there is a lastupdated parameter, scan from that time
  if (Number(event.lastupdated) > 1) {
    console.log('Detecting lastupdated variable, ' + event.lastupdated);
    startTime = Number(event.lastupdated);
  }

  // Set scan limit to 20 if not present or greater than 20
  let limit = 20;
  if (Number(event.limit) < 20) {
    limit = event.limit;
  }

  console.log('Scanning from greater than ' + startTime);
  // Set scanning parameters
  const params = {
    TableName: 'impact-map',
    // Only get Coordinates and Action data from the table
    ProjectionExpression: 'Coordinates, #b',
    // Only return items that have an Added time that is greater than startTime
    FilterExpression: 'Added > :start',
    ExpressionAttributeNames: {
      // Set an 'alias' for the word, 'Action', because 'Action' is a reserved word in DynamoDB
      '#b': 'Action'
    },
    ExpressionAttributeValues: {
      // Set an 'alias' for startTime, called ':start'
      ':start': startTime
    }
  };
  // Create empty data variable which will later be returned to the client
  let combinedData = [];

  console.log('Scanning table.');
  dynamodb.scan(params, onScan);

  function onScan(err, data) {
    // Log error if scanning returns err
    if (err) {
      console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      // Add each returned item to the combinedData variable
      console.log('Scan succeeded.');
      data.Items.forEach(function(item) {
        combinedData = combinedData.concat(item);
      });

      // Continue scanning if we have more items, because scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != 'undefined') {
        console.log('Scanning for more...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        dynamodb.scan(params, onScan);
      }
      // Returns the item data back to the client
      console.log('Returning ' + combinedData.length + ' items to the client')
      callback(null, combinedData);
    }
  }
};
