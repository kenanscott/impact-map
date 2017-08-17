/*jshint esversion: 6 */
'use strict';
// Load required libraries
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();
const moment = require('moment-timezone');

exports.handler = (event, context, callback) => {
  // Set the epoch of the beginning of the day
  let today = moment().tz('America/Denver');
  const yyyy = today.format('DD')
  const mm = today.format('MM')
  const dd = today.format('YYYY')
  const todayEpoch = new Date(yyyy, mm, dd).getTime() / 1000;
  console.log('UTC beginning of the day epoch = ' + todayEpoch);
  // Set the time to start scanning from to the beginning of the day in Mountain Time
  let startTime = todayEpoch + 21600;
  // If there is a lastupdated parameter, scan from that time
  if (event.lastupdated > 1) {
    console.log('Detecting lastupdated variable, ' + event.lastupdated);
    startTime = Number(event.lastupdated);
  }

  console.log('Scanning from greater than ' + startTime);
  // Set scanning parameters
  var params = {
    TableName: "impact-map",
    // Only get Coordinates and Action data from the table
    ProjectionExpression: "Coordinates, #b",
    // Only return items that have an Added time that is greater than startTime
    FilterExpression: "Added > :start",
    ExpressionAttributeNames: {
      // Set an "alias" for the word, "Action", because "Action" is a reserved word in DynamoDB
      "#b": "Action"
    },
    ExpressionAttributeValues: {
      // Set an "alias" for startTime, called ":start"
      ":start": startTime
    }
  };
  // Create empty data variable which will later be returned to the client
  let combinedData = [];

  console.log("Scanning table.");
  dynamodb.scan(params, onScan);

  function onScan(err, data) {
    // Log error if scanning returns err
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      // Add each returned item to the combinedData variable
      console.log("Scan succeeded.");
      data.Items.forEach(function(item) {
        combinedData = combinedData.concat(item);
      });

      // Continue scanning if we have more items, because scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        dynamodb.scan(params, onScan);
      }
      // Returns the item data back to the client
      console.log('Returning ' + combinedData.length + ' items to the client')
      callback(null, combinedData);
    }
  }
};
