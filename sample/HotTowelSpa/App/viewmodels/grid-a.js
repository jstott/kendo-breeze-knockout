define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system, datacontext) {
  var vm = {
    activate: activate,
    viewAttached: viewAttached,
    title: 'Grid via JQuery init',
  };

  return vm;


  function activate() {
    logger.log('Activated', null, 'grid-a', true);
    return true;
  }

  function viewAttached() {
    var grid = $("#grid-a").kendoGrid({
      columns: [
        { field: 'productName', title: 'Name' },
        { field: 'quantityPerUnit', title: 'Qty/Per' },
        { field: 'reorderLevel', title: 'Re-Order Lvl' }
      ],
      dataSource: new kendo.data.extensions.BreezeDataSource({
        entityManager: datacontext.manager,
        endPoint: "Products",        // endPoint can be a resource string or breeze query object
        defaultSort: "productName asc"
      }),
      pageable: { pageSize: 10 },
      sortable: true,
      filterable: false
    });
    return true;
  }

});