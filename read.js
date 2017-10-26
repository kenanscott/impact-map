/*jshint esversion: 6 */
/* globals console, require, exports*/
'use strict';
// Load required libraries
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();
const moment = require('moment-timezone');

exports.handler = (event, context, callback) => {

  let from;
  // If there is a lastupdated parameter, scan from that time
  if (Number(event.from) > 1) {
    console.log('Detecting from variable, ' + event.from);
    from = Number(event.from);
  } else {
    from = 1;
  }

  // Set scan limit to 20 if not present or greater than 20
  let limit = 20;
  if (Number(event.limit) < 20) {
    console.log('Detecting limit variable ' + event.limit);
    limit = event.limit;
  }

  console.log('Scanning from greater than ' + from);
  // Set scanning parameters
  let params = {
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
      ':start': from
    },
    Limit: limit
  };

  if (event.hasOwnProperty('exclusivestartkey') && event.exclusivestartkey !== '') {
    console.log('exclusivestartkey detected ' + event.exclusivestartkey);
    params.ExclusiveStartKey = {};
    params.ExclusiveStartKey.Id = event.exclusivestartkey;
  }

  console.log(params);

  console.log('Scanning table.');
  dynamodb.scan(params, onScan);

  function onScan(err, data) {
    // Log error if scanning returns err
    if (err) {
      console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Scan succeeded.');
      // Continue scanning if we have more items, because scan can retrieve a maximum of 1MB of data
      if (data.hasOwnProperty('LastEvaluatedKey')) {
        console.log('LastEvaluatedKey detected');
      }
      // Returns the item data back to the client
      console.log('Returning ' + data.Items.length + ' items to the client');
      callback(null, data);
    }
  }
};
