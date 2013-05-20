/*! kendo-breeze-knockout.datasource - v0.0.5 - 2013-05-20 - https://github.com/jstott/kendo-breeze-knockout.git */
/* Usage Examples - see the readme at https://github.com/jstott/kendo-breeze-knockout/blob/master/README.md */

(function ($, kendo, breeze, ko) {
  'use strict';

  kendo.data.extensions = kendo.data.extensions || {};

  function BreezeTransport(config) {
    this.entityManager = config.entityManager;
    this.endPoint = config.endPoint;
    this.defaultSort = config.defaultSort;
    this.mapping = config.mapping;  // Breeze entities (not projection queries) contain recursive properties (entityAspect, entityType) - eliminate those (at least) to prevent stack overflow when grid iterates properties
    this.onFail = config.onFail;
    this.inlineCount = config.serverPaging;
    this.serverPaging = config.serverPaging;
    this.serverSorting = config.serverSorting;
    this.serverFiltering = config.serverFiltering;
  }

  $.extend(BreezeTransport.prototype, {

    read: function (options) {
      var orderVal = this.defaultSort,
          filterPredicate = this.defaultFilter,
          sortOps = options.data.sort,
          filterOps = options.data.filter,
          useLocalCache = options.useLocalCache,
          query = {},
          payload = { data: [], total: 0 },
          self = this;

      if (typeof this.endPoint === 'string') {
        query = new breeze.EntityQuery(this.endPoint);
      } else {
        query = this.endPoint;
      }

      // apply Sorting
      if (sortOps && sortOps.length > 0) {
        orderVal = ''; // reset orderBy
        for (var i = 0; i < sortOps.length; i++) {
          if (i > 0) {
            orderVal += ",";
          }
          orderVal += sortOps[i].field + " " + sortOps[i].dir;
        }
      }
      if (this.serverSorting && orderVal) {
        query = query.orderBy(orderVal);
      }

      // apply filtering
      if (this.serverFiltering && filterOps && filterOps.filters.length > 0) {
        for (var x = 0; x < filterOps.filters.length; x++) {
          query = query.where(
            filterOps.filters[x].field,
            mapOperator(filterOps.filters[x].operator),
            filterOps.filters[x].value);
        }
      }

      // apply Paging
      if (this.serverPaging) {
        if (options.data.skip) {
          query = query.skip(options.data.skip);
        }
        if (options.data.take) {
          query = query.take(options.data.take);
        }
      }

      // apply Total Count
      query = query.inlineCount(this.inlineCount);
      
      /* needs further testing / documentation
      if (useLocalCache) {
        query = query.using(breeze.FetchStrategy.FromLocalCache);
      }
      */
      this.entityManager.executeQuery(query)
          .then(querySucceeded)
          .fail(queryFailed)
          .done();

      function querySucceeded(xhr) {

        payload.data = self.mapping.mapToJS(xhr.results);
        
        if (self.inlineCount) {
          payload.total = xhr.inlineCount;
        }
        options.success(payload); // notify the DataSource that the operation is complete
         return true;
      }
      
      function queryFailed(rejected) {
        payload.error = rejected;
        if (self.onFail) {
          self.onFail(rejected);
        }
        return true;
      }
    },

    create: function (options) {
      options.success(options.data);
    },
    update: function (options) {
      options.success(options.data);
    },
    destroy: function (options) {
      options.success(options.data);
    }
  });

  // Create the custom DataSource by extending a kendo.data.DataSource
  // and specify an init method that wires up needed functionality.
  kendo.data.extensions.BreezeDataSource = kendo.data.DataSource.extend({
    init: function (options) {
      // The endpoint and entityManager fields are required. If not specified, throw an error
      if (!options.entityManager) {
        throw new Error('A Breeze EntityManager object is required in order to use the DataSource with Breeze. Please specify an "entityManager" property in your options object.');
      }
      if (!options.endPoint) {
        throw new Error('An "endpoint" option is required in order to work with Breeze. Please specify an "endpoint" property in your options object.');
      }

      // set config values / defaults
      options.pageSize = defValue(options.pageSize, 10);
      options.serverPaging = defValue(options.serverPaging, true);//options.serverPaging || true;
      options.defaultSort = options.defaultSort || "";
      options.serverSorting = defValue(options.serverSorting, true);
      options.serverFiltering = defValue(options.serverFiltering, true);
      options.useLocalCache = defValue(options.useLocalCache, true);
      // Could be overridden at run-time.
      options.mapping = mergeInto({
        baseIgnore: ['entityType', 'entityAspect'],
        include: [],
        ignore: [],
        mapToJS : function(results) {
          var koMapping = { 
            'include': this.include, 
            'ignore': this.baseIgnore.concat(this.ignore) 
          };
          // if you override - you might not care about using ko.mapping?
          if (!ko.mapping) {
            throw new Error('knockout mapping plugin is required!');
          }
          return ko.mapping.toJS(results,koMapping);
        }
      }, options.mapping);
      options.schema = mergeInto({
        data: "data",
        total: "total",
        error: "error"
      }, options.schema);
      // build the transport and final options objects
      var breezeTransport = new BreezeTransport(options);
      options = $.extend({}, { transport: breezeTransport }, options);

      // Call the "base" DataSource init function and provide our custom transport object
      kendo.data.DataSource.fn.init.call(this, options);
    }
  });

  // helper allows passing in 'falsey' values for default values - so check for undefined vs more typical x || 'dftValue' style 
  function defValue(source, dftValue) {
    return (typeof source !== 'undefined' ? source : dftValue);
  }
  // helper to map kendo operators (from grid filter dropdown) to breeze operators
  function mapOperator(kendoOperator) {
    var kendoToBreeze = {
      'eq': 'eq',
      'neq': 'ne',
      'lt': 'lt',
      'lte': 'le',
      'gt': 'gt',
      'gte': 'ge',
      'startswith': 'startswith',
      'endswith': 'endswith',
      'contains': 'substringof'
    };
    return kendoToBreeze[kendoOperator];
  }
  // helper to combine (merge) o2 into object o1
  function mergeInto(o1, o2) {
    if (o1 === null || o2 === null)
      return o1;
    if (o2 === false) {
      return o2;
    }
    for (var key in o2)
      if (o2.hasOwnProperty(key))
        o1[key] = o2[key];

    return o1;
  }

})($, kendo, breeze, ko);