define(['services/logger', 'services/datacontext'], function (logger, datacontext) {
  var vm = function () {
    var self = this;

    this.activate = function () {
      logger.log('Grid Activated', null, 'grid', true);

      return true;
    };
    
    this.viewAttached = function (view) {
      logger.log('viewAttached', this.title, 'grid', false);
    };

    this.datacontext = datacontext;
    this.title = 'Grid via data-bind and viewmodel datasource';
    this.gridProductDataSource = function (widget, options) {
      widget.setDataSource(new kendo.data.extensions.BreezeDataSource({
          entityManager: self.datacontext.manager,
          endPoint: new breeze.EntityQuery.from('Products').expand('Category'),
          defaultSort: "productName asc",
          mapping: {
            ignore: ['products'] // category.products is recursive - ignore it
          },
          onFail: function(error) {
            logger.logError('Ouch - Product grid query failed...', error, 'details', true);
          },
          schema: {
            model: {
              fields: {
                unitPrice: { type: "number" },
                unitsInStock: { type: "number" },
                unitsOnOrder: { type: "number" }
              }
            }
          }
        })
      );
    };

    this.gridNumericFilter = function(element, options) {
      options = options || {format:'n0'}; // default 0 dec.
      element.kendoNumericTextBox(options);
    };
    
  };

  return vm;


});