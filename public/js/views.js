/*
 * Main Feed Views
 * */
var FeedMenuView = Backbone.View.extend({
  tagName: "ul",
  el: '#feed-menu',

  initialize: function() {
    this.listenTo(this.collection, 'add', this.render);
  },

  render: function() {    
    this.collection.sort();
    
    var $el = $(this.el),
       self = this;
    $el.html("");
    this.collection.each(function(feed) {
      var item;
      item = new FeedMenuItemView({ model: feed });
      $el.append(item.render().el);
    });
    
    return this;
  }
});

var FeedMenuItemView = Backbone.View.extend({
  template: _.template($("#feed-menu-item-template").html()),
  tagName: 'li',
  className: 'feed-menu-item',
 
  events: {
    'click': 'showFeedItems'
  },
  
  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  
  render: function() {
    var $el = $(this.$el);
    $el.data('feedId', this.model.get('id'));
    $el.html(this.template(this.model.toJSON()));
    return this;
  },
  
  showFeedItems: function() {
    var self = this;
    new FeedItemMenuView({collection: self.model.get("items")}).render();
    $("#feed-view").html("");
    return false;
  }
  
});

var FeedItemMenuView = Backbone.View.extend({
  el: $("#feed-menu-view"),
  
  initialize: function() {
    this.collection.on('add', this.render, this);
    this.collection.on('destroy', this.remove, this);
    this.collection.fetch();
  },
  
  render: function() {
    this.collection.sort();
    
    var $el = $(this.$el);
    $el.html("");
    this.collection.each(function(item) {      
      
      var itemView;
      itemView = new FeedItemMenuItemView({model: item});
      $el.append(itemView.render().el);
    });
    
    return this;
  }
});

var FeedItemMenuItemView = Backbone.View.extend({
  template: _.template($("#feed-item-menu-item-template").html()),
  tagName: 'li',
    className: "feed-item-menu-item",
  
  events: {
    'click': 'showFeedItem'
  },
  
  initialize: function() {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.remove, this);
  },
  
  render: function() {
    var $el = $(this.$el);
    $el.html(this.template(this.model.toJSON()));
    
    return this;
  },
  
  showFeedItem: function() {
    $("#feed-view").html(new FeedItemView({model: this.model}).render().el);
    this.model.set("read", true).save();
    return false;
  }
});

var FeedItemView = Backbone.View.extend({
  template: _.template($("#feed-item-template").html()),
  $el: $("#feed-view"),
  className: "feed-item",
  
  initialize: function() {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.remove, this);
  },
  
  render: function() {
    var $el = $(this.el);
    $el.html(this.template(this.model.toJSON()));
    
    return this;
  }
});

var AppView = Backbone.View.extend({
  el: $("#feedoapp"),

  initialize: function() {
    
    var FeedMenu = new FeedMenuView({collection: Feeds});
    Feeds.fetch();
    
  },
  
  events: {
    /* Add Feed Modal */
    "keyup #modal-add-feed #input-add-feed": "checkAddFeedInput",
    "keydown #modal-add-feed #input-add-feed": "checkAddFeedInput",
    "click #modal-add-feed .btn-primary": "addFeed"
  },
  
  /* Add Feed Modal */
  checkAddFeedInput: function() {
    var url = $("#input-add-feed").val();
    
    if ( url ) {
      $("#modal-add-feed .btn-primary").removeAttr('disabled');
    } else {
      $("#modal-add-feed .btn-primary").attr('disabled', 'disabled');
    }
  },
  addFeed: function() {
    var url = $("#input-add-feed").val();
    
    if ( url ) {
      
      // create feed
      var feed = new Feed({
        file_url: url
      });
      $("#modal-add-feed input, #modal-add-feed .btn").attr('disabled', 'disabled');
      // sync to server
      feed.save({}, {
        success: function(model, response, options) {
          $("#modal-add-feed").modal('hide');
        },
        error: function(model, xhr, options) {
          alert("Something went wrong adding the feed.");
        }
      });
      
    }
  }
  
});

var App = new AppView;
