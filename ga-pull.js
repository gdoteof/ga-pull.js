'use strict';


function GAPull(){
	var key  = require('../key.json');
	var util = require('util');
  var Promise = require('promise');

	var scope1 = 'https://www.googleapis.com/auth/analytics.readonly'
	var scope2 = 'https://www.googleapis.com/auth/analytics'

	var google = require('googleapis');
	var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, [scope1,scope2], null);

	var analyticsreporting = google.analyticsreporting('v4');

  var self = this;
  self.pageSize = 1000; // default
  self.maxResults = 99999999999; // default no limit

  var opts = {};
  opts.dateRanges = [];
  opts.dimensions = [];
  opts.metrics    = [];
  opts.orderBys   = [];

  opts.dimensionFilterClauses = [];

  self.setView      = function(viewId){
    opts.viewId = viewId;
    return self;
  }

  self.setMaxResults = function(maxResults){
    self.maxResults = maxResults;
    if(maxResults < self.pageSize){
      self.setPageSize( maxResults);
    }
    return self;

  }

  self.addDateRange = function(dateRange){
    opts.dateRanges.push(dateRange);
    return self;
  }

  self.addDimension = function(dimension){
    opts.dimensions.push(dimension);
    return self;
  }

  self.addDimensionFilter = function(dimensionFilter){
    opts.dimensionFilterClauses.push({filters:dimensionFilter});
    return self;
  }

  self.addMetric    = function(metric){
    opts.metrics.push(metric);
    return self;
  }

  self.addOrderBy   = function(orderBy){
    opts.orderBys.push(orderBy);
    return self;
  }

  self.setPageSize  = function(pageSize){
    opts.pageSize = pageSize;
  }

	self.setCallback = function(callback){
    opts.callback = callback;
	}

  self.reports = [];




  self.runReport = function(){
    return new Promise(function (resolve, reject){
      (function getData(pageToken){
        if(pageToken){
          opts.pageToken = pageToken
        }

        jwtClient.authorize( (err, token) => {
          if (err) {
            console.log("ERROR", err);
          }

          analyticsreporting.reports.batchGet(
              {
                auth: jwtClient,
                resource: {
                  "reportRequests": opts
                }
              },
              (err, resp) => {
                if(err){
                  console.log("ERROR", err);
                  reject(err);
                } else {
                  for(var i in resp.reports[0].data.rows){
                    if(typeof resp.reports[0].data.rows[i] == 'function'){
                    }
                  }
                  self.reports = self.reports.concat(resp.reports);
                  if(resp.reports[0].nextPageToken && self.maxResults > resp.reports[0].nextPageToken){
                    return getData(resp.reports[0].nextPageToken);
                  } else {
                    resolve(self.reports);
                  }
                }
              })
      
        })
      })()
      
    });
  }
}


module.exports = GAPull;
