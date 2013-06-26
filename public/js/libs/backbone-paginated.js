var PaginatedCollection = Backbone.Collection.extend({
  initialize: function() {
    _.bindAll(this, 'parse', 'nextPage', 'previousPage');
    typeof(options) != 'undefined' || (options = {});
    this.page = 1;
    typeof(this.perPage) != 'undefined' || (this.perPage = 10);
  },
  fetch: function(options) {
    typeof(options) != 'undefined' || (options = {});
    this.trigger("fetching");
    var self = this;
    var success = options.success;
    options.success = function(resp) {
      self.trigger("fetched");
      if(success) { success(self, resp); }
    };
    
    $.extend(true, options, {data: $.param({page: this.page, perPage: this.perPage})})
    
    return Backbone.Collection.prototype.fetch.call(this, options);
  },
  parse: function(resp) {
    return resp;
  },
  nextPage: function() {
    this.page = this.page + 1;
    return this.fetch();
  },
  previousPage: function() {
    this.page = this.page - 1;
    return this.fetch();
  }
 
});