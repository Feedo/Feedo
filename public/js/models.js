var Feed = Backbone.RelationalModel.extend({
  relations: [{
    type: Backbone.HasMany,
    key: 'items',
    relatedModel: 'FeedItem',
    collectionType: 'FeedItemCollection',
    collectionOptions: function(instance){ return {id: instance.id}; }
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

var FeedItemCollection = Backbone.Collection.extend({
  model: FeedItem,
  
  comparator: function(item) {    
    return -(new Date(item.get("published")).getTime());
  },
  
  initialize: function(data, options) {
    this.url = "/feeds/" + options.id + "/items";
  }
})

var Feeds = new FeedCollection;
