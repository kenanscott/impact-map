# impact-map
Impact Map for JesusCares.com

## Overview of write process ~226ms

1. A visitor loads a page or makes a commitment on JesusCares.com. Google Tag Manager loads the user.html script, sending a GET request to CloudFront. The request includes the query string parameter, action, which describes if this is a page view or commitment.
2. CloudFront sends the request to API Gateway since the URL begins with /rest
3. API Gateway sends the request to Lambda, along with the action name and IP address of the client.
4. Lambda in write.js creates a DynamoDB item with an unique ID, the time it was added, when it should expire, the coordinates of the client (looked up with geoip-lite) and what kind of action the client performed.
5. After about 24-48 hours, DynamoDB deletes the item based on the Expire field.

## Overview of read process ~115ms

1. A visitor loads the impact map page https://impact-map.jesuscares.com/, the client JavaScript sends a GET request to CloudFront to get information to place on the map. The same request happens every three seconds, if it is not the first request, a lastupdated query string parameter is sent, describing when the last time it got data was.
2. CloudFront sends the request to API Gateway since the URL begins with /rest
3. API Gateway sends the request to Lambda, along with the lastupdated time.
4. Lambda in read.js scans the DynamoDB table and returns items that were added since lastupdated. Or, if this is the first request and lastupdated isn't there, it will return all items that were added since the beginning of the day, Mountain Time.
