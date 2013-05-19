/*global _ */
define(['durandal/system', 'durandal/plugins/router', 'services/logger'],
    function(system, router, logger) {

        var manager = new breeze.EntityManager("api/Northwind"),
            breezQueryFailure = function(error) {
                logger.log('Error retrieving data', error, 'datacontext', true);
            };

        return {
            metadataStore: manager.metadataStore,
            manager: manager
        };
    });
    