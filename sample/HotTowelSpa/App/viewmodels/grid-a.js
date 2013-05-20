define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system, datacontext) {
  var vm = {
    activate: activate,
    viewAttached: viewAttached,
    dataSource: dataSource,
    manager: datacontext.manager,
    title: 'Grid via data-bind',
  };

  return vm;

  
  function activate() {
    logger.log('Activated', null, 'grid-b', true);
    
    return true;
  }
  function dataSource(widget) {
    widget.setDataSource(new kendo.data.extensions.BreezeDataSource({
        entityManager: manager,
        endPoint: 'Products',        // endPoint can be a resource string or breeze entityQuery
        defaultSort: 'productName asc',
        mapping: {
          ignore: ['products'] // not spec. asking for extension here - but grid-b does, and category.products will be cached!
        }
      })
    );
  }
  function viewAttached() {
    
    return true;
  }

});