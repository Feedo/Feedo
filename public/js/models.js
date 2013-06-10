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
  url: '/feeds'
});

var FeedItem = Backbone.RelationalModel.extend({
});

var FeedItemCollection = Backbone.Collection.extend({
  model: FeedItem,
  
  initialize: function(a, b) {
    this.url = "/feeds/"+b.id+"/items";
  }
})

var Feeds = new FeedCollection;
