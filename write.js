/*jshint esversion: 6 */
var AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    console.log(event);
    callback(null, 'Hello from Lambda');
    console.log(event.sourceIP.split(',', 1)[0])
};
