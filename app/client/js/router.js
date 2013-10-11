var APPNAME = "Feedo";

var Router = Backbone.Router.extend({
  routes: {
    "": "main",
    "feed/:id": "feed"
  },
  
  main: function() {
    document.title = APPNAME;
  },
  
  feed: function(id) {
    var self = this;
    Feeds.fetch().done(function(){
      var feed = Feeds.get(id);
      self.itemMenuView = new FeedItemMenuView({
        collection: feed.get("items") // based on items from the model
      });
      // remove all buttons to avoid confusion (!!!)
      $('#btn-next-page').remove();
      self.itemMenuView.render(); // render to DOM
      
      document.title = APPNAME + " - " + feed.get("title");
    });
  }
});

FeedoRouter = new Router;

Backbone.history.start({
  pushState: true
});