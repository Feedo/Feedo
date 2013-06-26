/*
 * Main Feed Views
 * */
/* Feed List Container */
var FeedMenuView = Backbone.View.extend({
  tagName: "ul",
  // our container div#id
  el: '#feed-menu',

  initialize: function() {
    // add items when they are
    this.listenTo(this.collection, 'add', this.render);
    // listen to changes
    this.listenTo(this.collection, 'change', this.render);
  },

  render: function() {
    // save for later usage
    var self = this;
    
    // sort the feeds
    self.collection.sort();
  
    // remove all prior content
    self.$el.html("");
    // add each feed
    self.collection.each(function(feed) {
      // new feed view object, based on feed data
      var item = new FeedMenuItemView({
        model: feed
      });
      
      // add to list
      self.$el.append(item.render().el);
    });
    
    return self;
  }
});
/* Feed List Item */
var FeedMenuItemView = Backbone.View.extend({
  // template to use
  template: _.template($("#feed-menu-item-template").html()),
  tagName: 'li',
  // class to use
  className: 'feed-menu-item',
  
  // attach event handler
  events: {
    'click': 'showFeedItems'
  },
  
  initialize: function() {
    // listen to changes to the items
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  
  render: function() {
    // add some data to the DON
    this.$el.data('feedId', this.model.get('id') );
    // render from model to template
    this.$el.html(this.template(this.model.toJSON()));
    
    return this;
  },
  
  showFeedItems: function() {
    // save for later usage
    var self = this;
    
    // create new view for feed items
    new FeedItemMenuView({
      collection: self.model.get("items") // based on items from the model
    }).render(); // render to DOM
    // clear the item view
    $("#feed-view").html("");
    
    return false;
  }
  
});

/* Feed's item list */
var FeedItemMenuView = Backbone.View.extend({
  // our container div#id
  el: $("#feed-menu-view"),
  
  initialize: function() {
    // listen to changes to the model
    this.collection.on('add', this.render, this);
    this.collection.on('destroy', this.remove, this);
    // load feed items!!!
    this.collection.fetch();
  },
  
  render: function() {
    // save for later usage
    var self = this;
    
    // sort the feed's items
    self.collection.sort();
    
    // remove all items already there
    self.$el.html("");
    // add each of the feed's items
    self.collection.each(function(item) {      
      // create new view object...
      var itemView = new FeedItemMenuItemView({
        model: item // ... based on the model
      });
      
      // add to view
      self.$el.append(itemView.render().el);
    });
    
    // "Load more..." button
    var nextPage = document.createElement("button");
    $(nextPage).addClass("btn btn-primary ladda-button");
    $(nextPage).attr('data-style', 'contract');
    $(nextPage).html('<span class="ladda-label">Load more...</span>');
    var l = Ladda.create(nextPage);
    
    $(nextPage).click(function() {
      l.start();
      
      self.addNextPage();
    });
    
    
    var wrapper = document.createElement("li");
    $(wrapper).css('text-align', 'center');
    $(wrapper).append(nextPage);
    self.$el.append(wrapper);
    
    return this;
  },
  
  addNextPage: function(callback) {
    // load next page
    this.collection.addNextPage();
  }
});
/* Feed's item list ITEM */
var FeedItemMenuItemView = Backbone.View.extend({
  // template to use
  template: _.template($("#feed-item-menu-item-template").html()),
  tagName: 'li',
  // class to use
  className: "feed-item-menu-item",
  
  // attach event handler
  events: {
    'click': 'handleClick'
  },
  
  initialize: function() {
    // listen for changes on model
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.remove, this);
  },
  
  render: function() {
    // render the template
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.find('.feed-content').hide();
    
    // add/remove 'read' class indicator
    if ( !this.model.get("read") ) {
      this.$el.addClass("unread");
    } else {
      this.$el.removeClass("unread");
    }
    
    // make links open in new tab
    this.$el.find('.feed-content a').attr('target', '_blank').data('external-link', true);
    // add alt text to images, if they have none
    if ( !this.$el.find('.feed-content img').attr('alt') ) {
      this.$el.find('.feed-content img').attr('alt', 'Image');
    } 
    
    return this;
  },
  
  handleClick: function(e) {
    var $el = $(e.target);
    
    // if is link by us
    if ( !$el.data('external-link') ) {
      return this.toggleVisibility();
    }
  },
  
  toggleVisibility: function() {
    if ( !this.model.get("read") ) {
      // save read state
      this.model.set("read", true).save();
    }
    
    if ( !this.$el.hasClass("open") ) {
      this.$el.addClass("open");
      this.$el.find('.feed-abstract').fadeOut('fast');
      
      this.$el.find('.feed-content').fadeIn();
    } else {
      this.$el.removeClass("open");
      this.$el.find('.feed-abstract').fadeIn();
      
      this.$el.find('.feed-content').fadeOut('fast');
    }
    
    this.$el.smoothScrollTop();
    
    return false;
  },
});

var AppView = Backbone.View.extend({
  el: $("#feedoapp"),

  initialize: function() {
    
    var FeedMenu = new FeedMenuView({
      collection: Feeds
    });
    Feeds.fetch();
    
  },
  
  updateAndRefresh: function() {
    // save for later usage
    var self = this;
    
    // add a indicator for progress
    $("#btn-refresh .icon-refresh").addClass("rotating");
    // make the server parse the feeds
    $.get("/update_feeds", function(responseData) {
      // something should have happened, let's see...
      self.refresh();
      
      $("#btn-refresh .icon-refresh.rotating").removeClass("rotating");
    });
  },
  refresh: function() {
    Feeds.fetch();
  },
  
  events: {
    /* Add Feed Modal */
    "keyup #modal-add-feed #input-add-feed": "checkAddFeedInput",
    "keydown #modal-add-feed #input-add-feed": "checkAddFeedInput",
    "click #modal-add-feed .btn-primary": "addFeed",
    
    "click #btn-refresh": "updateAndRefresh"
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
    // save for later usage
    var self = this;
    // get the url from the user
    var url = $("#input-add-feed").val();
    
    if ( url ) {
      
      // create the feed object
      var feed = new Feed({
        file_url: url
      });
      // disable all controls
      $("#modal-add-feed input, #modal-add-feed .btn").attr('disabled', 'disabled');
      // sync to server
      feed.save({}, {
        // yay! We did it!
        success: function(model, response, options) {
          $("#modal-add-feed").modal('hide');
          
          self.refresh();
        },
        // Server-side guy messed up again
        error: function(model, xhr, options) {
          alert("Something went wrong adding the feed.");
        }
      });
      
    }
  }
  
});

var App = new AppView;
