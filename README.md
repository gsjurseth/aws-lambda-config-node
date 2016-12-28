# aws-lambda-config-node
Generic function for storing config for lambda functions. In point of fact it's not lambda specific,
but this was the inspiration from my own end for writing it.

## Why did you write this?
When using AWS Lambdas you have a problem of dealing with multiple accounts and configuration.

 Where do I store my data?
   Either as a packaged config file in your lambda definition (YUCK)
 or
    You use something like this. 
   

## Grab a single config
So the code is quite simple and returns a promise containing the the config object retrieved 
from the dynamodb table in question.

```javascript
var cf = require('aws-cfg');

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


## Grab multiple configs
Sometimes you want to grab multiple configurations and leave them sorted by their respective configNames.
Consider the following:

```javascript
cf.setDefaults({
  tableName: 'sharedConfigTable',
  region: 'eu-west-1',
  debug: false
});

cf.mergeConfigs([
  '$LATEST:firstProject',
  '$LATEST:secondProject',
  {
    configName: '$LATEST:third-private',
    tableName: 'PrivateConfigTable',
    region: 'eu-west-1',
    debug: false
  }
])
.then(function(d) {
  console.log('This is the d: %j', d);
})
```

Here we've called mergeConfigs instead of the single config function. This will iterate over the list sent to it.
Here i've sent both strings (the configName) and an object to merge configs. If you send a string then you must
have called setDefaults prior. Otherwise you simply send an object that contains at least configName and tableName.

This will like above fetch them all, but will return as a single hash where each configNames points to its
own "config" hash.

## Table setup
Simply a two column dynamodb table:
 * column 1 is the primary key (no sort needed): configName
 * column 2 contains the config (type map) itself and is called: config

