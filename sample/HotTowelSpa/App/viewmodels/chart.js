define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system, datacontext) {
  var vm = {
    activate: activate,
    title: 'Chart via knockout-kendo',
    items : [
        { name: "one", value: 10 },
        { name: "two", value: 20},
        { name: "three", value: 30 }
    ],
    dataItems: dataItems
  };

  return vm;
  
  function dataItems(widget) {
    widget.dataSource.data(vm.items);
  }

  function activate() {
    logger.log('Activated', null, 'grid-a', true);
    return true;
  }

  

});