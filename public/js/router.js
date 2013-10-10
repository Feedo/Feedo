var Router = Backbone.Router.extend({
  routes: {
    "": "main",
    "feed/:id": "feed"
  },
  
  main: function() {
    
  },
  
  feed: function(id) {
    console.log(id);
    var self = this;
    Feeds.fetch().done(function(){
      var feed = Feeds.get(parseInt(id));
      self.itemMenuView = new FeedItemMenuView({
        collection: feed.get("items") // based on items from the model
      });
      // remove all buttons to avoid confusion (!!!)
      $('#btn-next-page').remove();
      self.itemMenuView.render(); // render to DOM
    });
    
  }
});

FeedoRouter = new Router;

Backbone.history.start({
});