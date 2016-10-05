# aws-lambda-config-node
Generic function for storing config for lambda functions. In point of fact it's not lambda specific,
but this was the inspiration from my own end for writing it.

## Why did you write this?
When using AWS Lambdas you have a problem of dealing with multiple accounts and configuration.

 Where do I store my data?
   Either as a packaged config file in your lambda definition (YUCK)
 or
    You use something like this. 
   

## Grab some config
So the code is quite simple and returns a promise containing the the config object retrieved 
from the dynamodb table in question.

```javascript
var cf = require('aws-lambda-config');

cf.config({
  configName: '$LATEST:someConfig',
  tableName: 'sharedConfigTable',
  region: 'eu-west-1',
  debug: false
})
.then(function(d) {
  console.log('This is the d: %j', d);
});
```

This returns the "config" element from the 'sharedConfigTable' table where the configName field
(the primary key) is equal to "$LATEST:someConfig"

## Table setup
Simply a two column dynamodb table:
 * column 1 is the primary key (no sort needed): configName
 * column 2 contains the config (type map) itself and is called: config

