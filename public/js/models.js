var Feed = Backbone.RelationalModel.extend({
  relations: [{
    type: Backbone.HasMany,
    key: 'items',
    relatedModel: 'FeedItem',
    collectionType: 'FeedItemCollection',
    collectionOptions: function(instance){ return {instance: instance}; }
  }],
  
  url: "/feeds"
});

var FeedCollection = Backbone.Collection.extend({
  model: Feed,
  url: '/feeds',
  
  comparator: function(feed) {
    return new Date(feed.get("id")).getTime();
  }
});

var FeedItem = Backbone.RelationalModel.extend({
});

var FeedItemCollection = PaginatedCollection.extend({
  model: FeedItem,
  
  comparator: function(item) {    
    return -(new Date(item.get("published")).getTime());
  },
  
  initialize: function(data, options) {
    var self = this;
    
    options.instance.bind("change", function() {
      self.baseUrl = "/feeds/" + options.instance.id + "/items";
      self.fetch();
    });
    
    self.baseUrl = "/feeds/" + options.instance.id + "/items";
    
    return PaginatedCollection.prototype.initialize.call(this)
  }
})

var Feeds = new FeedCollection;
