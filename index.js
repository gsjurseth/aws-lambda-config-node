'use strict';
const
  Promise   = require('bluebird'),
  _         = require('lodash'),
  aws       = require('aws-sdk');

// Use bluebird implementation of Promise
aws.config.setPromisesDependency(require('bluebird'));

const self = exports;

exports.defaults = {};

exports.parseArgs = list => {
  let _cf = [];
  list.forEach( i => {
    if (typeof(i) === 'string') {
      if ( _.has(self.defaults, 'tableName') ) {
        _cf.push({
          configName: i,
          tableName: self.defaults.tableName,
          region: self.defaults.region ? self.defaults.region : aws.config.region,
          debug: self.defaults.debug ? self.defaults.debug : false
        });
      }
      else {
        throw new Error("tableName not defined. Have only configName: " + i);
      }
    }
    else {
      if ( _.has(i,'configName') ) {
        if ( (_.has(self.defaults, 'tableName')) || (_.has(i,'tableName')) ) {
          _cf.push({
            configName: i.configName,
            tableName: self.defaults.tableName,
            region: self.defaults.region ? self.defaults.region : aws.config.region,
            debug: self.defaults.debug ? self.defaults.debug : false
          });
        }
        else {
          throw new Error("tableName not defined. Have only configName: " + i.configName);
        }
      }
    }
  });
  return _cf;
}

/*
 * @params {array} list of either strings (setDefaults previously called) or config objects
 * @returns {object} an object of configName: {configs}
 */
exports.mergeConfigs = list => {
  return Promise.map(self.parseArgs(list), self.config)
  .then( cf => {
    let config = {};
    cf.forEach( i => {
      config[i.configName] = i.config;
    });
    return config;
  });
}

exports.setDefaults = o => {
  _.assign(self.defaults, o);
}

exports.config = p => {
  let debug = false;
  if ( _.has(p, 'debug') ) {
    if (p.debug) {
      debug = true;
    }
  }
  if ( _.has(p,'region') ) {
    aws.config.update({region: p.region});
  }

  if (debug) {
    console.info('--## Trying config %s from table: %s in region: %s ##--', p.configName,p.tableNam,p.region);
  }

  let params = {
    TableName: p.tableName,
    Key: { configName: p.configName }
  };

  const dynDB   = new aws.DynamoDB.DocumentClient();
  return dynDB.get(params).promise()
  .then(function(d) {
    if (debug) {
      console.info('--## Fetched this config: %j ##--', d.Item);
    }
    if ( _.isUndefined(d.Item) ) {
      throw new Error("Couldn't find config for name: " + p.configName);
    }
    return d.Item;
  });
}
