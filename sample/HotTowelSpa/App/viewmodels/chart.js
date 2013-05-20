define(['services/logger', 'durandal/system', 'services/datacontext'], function (logger, system, datacontext) {
  var ViewModel = function () {
    var self = this;
    this.title= 'Chart via knockout-kendo';
    this.items = [
        { name: "one", value: 10 },
        { name: "two", value: 20 },
        { name: "three", value: 30 }
    ];
    
    this.fnDataItems = function (widget, options) {
      widget.dataSource.data(self.items);
    };
  };


  ViewModel.prototype.activate = function() {
    logger.log('Chart Activated', null, 'chartVM', true);
    return true;
  };

  return ViewModel;

  

});