define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system, datacontext) {
  var vm = {
    activate: activate,
    viewAttached: viewAttached,
    manager: datacontext.manager,
    title: 'Grid via data-bind',
  };

  return vm;

  
  function activate() {
    logger.log('Activated', null, 'grid-b', true);
    
    return true;
  }

  function viewAttached() {
    
    return true;
  }

});