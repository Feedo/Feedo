var FeedMenuView = Backbone.View.extend({
  tagName: "ul",
  el: '#feed-menu',

  initialize: function() {
    this.listenTo(this.model, 'add', this.render);
  },

  render: function() {    
    var $el = $(this.el),
       self = this;
    $el.html("");
    this.model.each(function(feed) {
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
    
    var FeedMenu = new FeedMenuView({model: Feeds});
    Feeds.fetch();
    
  }
});

var App = new AppView;
