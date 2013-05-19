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
              router.mapNav('grid-a'); // js object creation
              router.mapNav('grid-b'); // html attribute creation
              router.mapNav('grid-c'); // html attr / js datasource
              router.mapNav('chartVM'); // 
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