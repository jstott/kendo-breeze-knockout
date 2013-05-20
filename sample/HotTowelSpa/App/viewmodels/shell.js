define(['durandal/system', 'durandal/plugins/router', 'services/logger', 'services/datacontext'],
    function (system, router, logger, datacontext) {
        var shell = {
            activate: activate,
            router: router
        };
        
        return shell;

        function activate() {
          return boot()
            .then(function () {
              log('Hot Towel SPA Loaded!', null, true);
              return true;
            });
          
        }

        function boot() {
          return datacontext.manager.fetchMetadata()
            .then(function() {
              router.mapNav('home');
              router.mapNav('grid-a'); // simple
              router.mapNav('grid-b'); // extended collection
              router.mapNav('chart'); // 
              
              // *******************************************************************
              // key to setting up binding to DataSource Extension correctly 
              // override ko.kendo plug-in - must be done somewhere in runtime
              // only required to execute once
              // *******************************************************************
              ko.kendo.setDataSource = function (widget, fnCall, options) {
                fnCall(widget, options);
              };
              
              return router.activate('home');
            });
        }

        function log(msg, data, showToast) {
           logger.log(msg, data, system.getModuleId(shell), showToast);
        }

    });