const
  Promise   = require('bluebird'),
  _         = require('lodash'),
  aws       = require('aws-sdk');

//exports.config = (configName, configTable, region) => {
exports.config = (p) => {
  debug = false;
  if ( _.has(p, 'debug') ) {
    if (p.debug) {
      debug = true;
    }
  }
  if ( _.has(p,'region') ) {
    aws.config.region = p.region;
  }

  if (debug) {
    console.info('--## Trying config %s from table: %s in region: %s ##--', p.configName,p.tableNam,p.region);
  }

  var dynDB   = Promise.promisifyAll(new aws.DynamoDB.DocumentClient());
  var params = {
    TableName: p.tableName,
    Key: { configName: p.configName }
  };

  return dynDB.getAsync(params)
  .then(function(d) {
    if (debug) {
      console.info('--## Fetched this config: %j ##--', d.Item);
    }
    return d.Item;
  });
}
