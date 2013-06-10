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
    $("#feed-view").html(new FeedView({model: self.model}).render().el);
    return false;
  }
  
});

var FeedView = Backbone.View.extend({
  el: $("#feed-view"),
  
  initialize: function() {
    this.model.get("items").on('add', this.render, this);
    this.model.get("items").on('destroy', this.remove, this);
    this.model.get("items").fetch();
  },
  
  render: function() {
    var $el = $(this.$el);
    $el.html("");
    this.model.get("items").each(function(item) {      
      
      var itemView;
      itemView = new FeedItemView({model: item});
      $el.append(itemView.render().el);
    });
    return this;
    
  }
});

var FeedItemView = Backbone.View.extend({
  template: _.template($("#feed-item-template").html()),
  tagName: 'li',
  
  render: function() {
    var $el = $(this.$el);
    $el.html(this.template(this.model.toJSON()));
    return this;
  }
});

var AppView = Backbone.View.extend({
  el: $("#feedoapp"),

  initialize: function() {
    Feeds.fetch();
    
    var FeedMenu = new FeedMenuView({model: Feeds});
    
  }
});

var App = new AppView;
