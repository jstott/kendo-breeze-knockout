define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system,datacontext) {
  var vm = {
    activate: activate,
    title: 'Home View',
  };

  return vm;

  //#region Internal Methods
  function activate() {
    logger.log('Home View Activated', null, 'home', true);
    return true;
  }

});