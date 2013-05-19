## Kendo-Breeze-Knockout-DataSource

KendoUI DataSource extension to integrate [Kendo UI][3], [BreezeJS][4], [KnockoutJS][5] and [knockout-kendo][7] 
with KendoUI widgets (Grid specifically).  
A sample .net Single Page Application (SPA) solution is also available based on the [HotTowel template][hottowel].

## Key Points
* Breeze entities in particular have two recursive properties (entityAspect and entityType) that will cause stackoverflow issues when the Grid iterates over the returned properties. By default, the `mapping` property will do this automatically, or you can override completely. 
* Map Grid filtering operators (e.g. 'Not Equal' Grid: 'neq' and Breeze: 'ne')
* Databind Grid from `ko.applyBindings(...)` action using data-bind='kendoGrid...' attribute.  This allows configuration of the Grid itself primarily from the data-bind attribute, yet allows JQuery plugin initialization.

#### Sample Usage - pick your flavor
#### Style 1 - mix of html data-bind and js / viewmodel datasource   

        <div data-bind="kendoGrid: {
        	data: gridProductDataSource,
        	columns: [
              { field: 'ProductName', title: 'Name'},
              { field: 'Supplier.SupplierName', title: 'Supplier'},
              { field: 'Category.CategoryName', title: 'Category' }
            ],
        	pageable: { pageSize: 10 },
        	sortable: true
        }">
        </div>


        this.gridProductDataSource = function (widget, options) {
        	widget.setDataSource(new kendo.data.extensions.BreezeKODataSource({
        		entityManager: self.manager,
        		endPoint: "Products",
        		defaultSort: "productName asc"
        		})
        	);
        };

#### Style 2 - html data-bind alone    


        <div data-bind="kendoGrid: {
            data: function (widget, options) {
                widget.setDataSource(new kendo.data.extensions.BreezeDataSource({
                    entityManager: manager,
                    endPoint: 'Products',        // endPoint can be a string or breeze entityQuery
                    defaultSort: 'productName asc'
                })
                );
            },
            columns: [
            { field: 'productName', title: 'Name' },
            { field: 'quantityPerUnit', title: 'Qty/Per' },
            { field: 'reorderLevel', title: 'Re-Order Lvl' }
            ],
              pageable: { pageSize: 10 },
              sortable: true,
              filterable: false
        }"></div>

#### Style 3 - JQuery initialization (does not require kendo-knockout library)

        $("#grid-a").kendoGrid({
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


## For your own sanity - please read this section!
Using style 1 or 2, you must override the `setDataSource` function from [knockout-kendo][7] somewhere in your runtime code: 


        ko.kendo.setDataSource = function (widget, fnCall, options) {
            fnCall(widget, options);
        };


This will allow the html markup   
`<div data-bind="kendoGrid: { data: gridProductDataSource ..." ...>`  
function you've set to be called on `ko.applyBindings`.  
The target function `data: gridProductDataSource` should set the widget datasource with this new extension object.

        this.gridProductDataSource = function (widget, options) {
          widget.setDataSource(new kendo.data.extensions.BreezeDataSource({
              entityManager: self.datacontext.manager,
              endPoint: new breeze.EntityQuery.from('Products').expand('Category'),
              defaultSort: "productName asc",
              mapping: {
                ignore: ['products'] // category.products is recursive - ignore it
              }
            })
          );
        };


You can expand upon the ko.kendo.setDataSource override example supplied and inspect the parameters to see if you need to call a function, or if you can set the data directly.  Go wild - but use this to get started, then modify as needed for your implementation.
 
### But I need to use other widgets too!
Indeed, don't despair.  Here is the basic sample from the [knockout-kendo Chart][ko-kendo-chart] sample, and this is all you need to do...
Change `kendoChart: { data: items` to `kendoChart: { data: dataItems`, where dataItems is a function in your viewmodel.


        <div data-bind="kendoChart: { data: dataItems, series: [{ name: 'sample', field: 'value' }] }"> </div>

        ....

        var ViewModel = function() {
            var self = this;  // create closure to get back to this instance
            this.items = [
                { name: "one", value: 10 },
                { name: "two", value: 20},
                { name: "three", value: 30 }
            ];
           this.dataSeries = function(widget, options) {
           	widget.dataSource.data(self.items); // use closure created above
            }
        };

        ko.applyBindings(new ViewModel());

The key is to create a closure so you can get back to the ViewModel instance when dataSeries is called on data-bind.
When `dataSeries` is called, `this` will be a `window` object, not your viewmodel.  The closure `self` will allow you
to reference `items` to set the widget.dataSource.data.

Again, you could craft up additional logic in the setDataSource override to take care of some of your particular use case if needed.

## Configuration Options
The following lists all available properties and their defaults and if required [*]:


        {
          entityManager: null,    // [*] Breeze manager 
          endPoint: "",           // [*] Entity string name or EntityQuery instance object
          defaultSort: "",        // define default sort 
          autoMapToJS: {          // Will autoMap  Breeze Entities - can set false
            baseIgnore: ['entityType', 'entityAspect'],
            include: [],
            ignore: [],
            mapping : function(results) {
              baseIgnore: ['entityType', 'entityAspect'],
              include: [],
              ignore: [],
              mapToJS : function(results) {
                var koMapping = { 
                  'include': this.include, 
                  'ignore': this.baseIgnore.concat(this.ignore) 
                };
              // if you override - you might not care about using ko.mapping?
              if (!ko.mapping) {
                throw new Error('knockout mapping plugin is required!');
              }
              return ko.mapping.toJS(results,koMapping);
            }
          },
          onFail: null,           // Called on error from manager.execute or mapping
          schema: {               // Can also define model for column datatypes here
            data: "data",
            total: "total",
            error: "error"
          },
          pageSize: 10,           // Pagesize for Breeze query (e.g. take = 10)
          serverPaging: true      // Sets Breeze query 'inlineCount=serverPaging'
          serverFiltering: true   // Enable Breeze query filtering to be applied from Grid
          serverSorting: true     // Enable Breeze query sorting to be applied from Grid
          ...
          // requestStart, requestStop, or any other valid kendo.dataSource properties are valid as well.
        }

## Mapping of data
When Breeze returns data from a successful query execution, it is handled in by the querySucceeded function.  
You can override by supplying your own method in `mapping.mapToJS : function(xhr.results)`.  (Mapping overall is not explicitly required for Breeze projection entities, as they do not have `entityType` and `entityAspect` properties).

kendo-breeze-knockout-datasource will call mapping.mapToJS with the Breeze results.

        function querySucceeded(xhr) {

        payload.data = self.mapping.mapToJS(xhr.results);
        
        if (self.inlineCount) {
          payload.total = xhr.inlineCount;
        }
        options.success(payload); // notify the DataSource that the operation is complete
         return true;
      }

mapping.mapToJS:

        mapToJS : function(results) {
          var koMapping = { 
            'include': this.include, 
            'ignore': this.baseIgnore.concat(this.ignore) 
          };
          // if you override - you might not care about using ko.mapping?
          if (!ko.mapping) {
            throw new Error('knockout mapping plugin is required!');
          }
          return ko.mapping.toJS(results,koMapping);
        }

## Run the SPA Sample
The SPA sample uses the BreezeJS, KnockoutJS, DurandalJS, EnityFramework, and the Northwind db  - all direct from the HotTowel template (less the db and context/model classes).
Build the HotTowel solution, run, then click one of the 'Grid' tabs.  The each grid will databind with the Northwind/Products data via Knockout, Breeze, and this extension.
Paging, Sorting, and Filtering are all enabled.  
Watch the browser developer tools network log to see the specific query requests

### Not Addressed
Create, Update, and Delete are not addressed at this time.

### Compatibility and Requirements
Breeze-KO-Kendo is designed to work with Kendo UI's web control Grid at this point, support for other 
Kendo UI controls simply has not been tested.

The Breeze-KO-Kendo extension currently depend on the following libraries:

* [jQuery][10] v1.8.2
* [Kendo UI][3] v2013.1.319
* [BreezeJS][4] v1.3.x
* [KnockoutJS][5] v2.2.1
* [Knockout.mapping][9] v2.4.1 (required for autoMapToJS to convert Breeze entities to JS)
* [kendo-labs/knockout-kendo][7] v0.6 (not required with JQuery intialization style - and not using data-bind attribute)

## Source Code and Downloads

Download the plugin from here or grab the latest build from the source. Reference breeze.ko.kendo.datasource.js after the scripts for Knockout and Kendo UI (requires jQuery).

	<script src="js/jquery.min.js"></script>
	<script src="js/kendo.web.min.js"></script>
	<script src="js/knockout-2.2.0.js"></script>
	<script src="js/knockout-kendo.min.js"></script>
	<script src="js/knockout-kendo-mapping.min.js"></script>
	<script src="js/breeze.ko.kendo.datasource.js"></script>

## License / Disclaimer
This project has been released under the [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html), 
the text of which is included below. This license applies ONLY to this specific project source and does not extend to 
any other libraries used or referenced.


> Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

> [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

>  Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
This is not in any way an official part of any other offering from anyone else. 
Please do not create support requests for this project in KendoUI, BreezeJS, KnockoutJS, DurandalJS, etc., please post here or on a community forum such as [stackoverflow](http://stackoverflow.com/).

[1]: https://github.com/kendo-labs/breeze-kendo) 
[hottowel]: http://www.asp.net/single-page-application/overview/templates/hottowel-template 
[3]: http://kendoui.com 
[4]: http://brezejs.com 
[5]: http://knockoutjs.com 
[6]: http://labs.kendoui.com/#projects 
[7]: https://github.com/kendo-labs/knockout-kendo
[8]: http://durandaljs.com/
[9]: https://github.com/SteveSanderson/knockout.mapping
[10]: http://www.jquery.com
[override]: https://github.com/kendo-labs/knockout-kendo/blob/master/src/knockout-kendo-core.js#L217
[ko-kendo-chart]: http://kendo-labs.github.io/knockout-kendo/dataviz/Chart.html
