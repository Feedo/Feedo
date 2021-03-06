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
    'click': 'showFeedItems',
    'click .btn-delete-feed': 'deleteFeed',
  },
  
  initialize: function() {
    // listen to changes to the items
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  
  render: function() {
    // add some data to the DOM
    this.$el.data('feedId', this.model.get('id') );
    // render from model to template
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  
  showFeedItems: function() {
    console.log(this.model.id);
    FeedoRouter.navigate("feed/" + this.model.id + "-" + this.model.get("title").toLowerCase(), {trigger: true});
    return false;
  },
  deleteFeed: function() {
    var feedTitle = this.model.get("title");
    $("#modal-delete-feed .feed-title").text(feedTitle);
    $("#modal-delete-feed").modal('show').data('feed-model', this.model);
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
  initializePaginationButton: function() {
    // save for later usage
    var self = this;
    
    // build button
    if ( !self.nextButton && self.$el ) {
      // "Load more..." button
      var nextPage = document.createElement("button");
      $(nextPage).addClass("btn btn-primary ladda-button");
      $(nextPage).attr('data-style', 'contract');
      $(nextPage).html('<span class="ladda-label">Load more...</span>');
      var ladda = Ladda.create(nextPage);
      $(nextPage).click(function() {
        // start the animation
        ladda.start();
      
        self.addNextPage(function() {
          // stop animation
          ladda.stop();
        });
      });
      
      var wrapper = document.createElement("div");
      $(wrapper).attr('id', 'btn-next-page');
      // center the button
      $(wrapper).css('text-align', 'center');
      $(wrapper).append(nextPage);
      
      self.nextButton = wrapper;
    }
    
    // add button if none is there
    if ( $('#btn-next-page').length == 0 ) {
      self.$el.after(self.nextButton);
    }
    
    // show the button only if there are more items to load
    if ( self.collection.length < ( self.collection.page * self.collection.perPage ) ) {
      $(self.nextButton).fadeOut();
    } else {
      $(self.nextButton).fadeIn();
    }
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
    
    self.initializePaginationButton();
    self.$el.data('view', self);
    
    return this;
  },
  
  addNextPage: function(success) {
    // save for later usage
    var self = this;
    
    // load next page
    self.collection.addNextPage(function(newCollection) {
      success && success(newCollection);
      
      // total amount of items loaded
      var newLength = newCollection.length;
      // when there are no more pages...
      if ( newLength < ( newCollection.page * newCollection.perPage ) ) {
        // remove the button
        $(self.nextButton).hide();
      }
    });
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
      this.model.set("read", true).save({}, {
        success: function() {
          Feeds.fetch();
        }
      });
    }
    
    if ( !this.$el.hasClass("open") ) {
      // if not opened, do it
      if ( !this.$el.find('.feed-content').text() ) {
        // if we have no content yet, get it
        // content is either the content itself, or
        // if the feed does not provide any content but rather only the summary
        // than use that one (e.g. XKCD)
        var content = ( this.model.get("content") ) ? this.model.get("content") : this.model.get("summary");
        
        // add the content as HTML (to load images, flash etc)
        this.$el.find('.feed-content').html(content);
        
        // make links open in new tab
        this.$el.find('.feed-content a').attr('target', '_blank').data('external-link', true);
        // add alt text to images, if they have none
        if ( !this.$el.find('.feed-content img').attr('alt') ) {
          this.$el.find('.feed-content img').attr('alt', 'Image');
        }
      }
      
      // add 'open' class
      this.$el.addClass("open");
      // fade out abstract
      this.$el.find('.feed-abstract').fadeOut('fast');
      
      // and show content
      this.$el.find('.feed-content').fadeIn();
    } else {
      // remove the 'open' class
      this.$el.removeClass("open");
      // fade in abstract
      this.$el.find('.feed-abstract').fadeIn();
      
      // hide the main content
      this.$el.find('.feed-content').fadeOut('fast', function() {
        // remove content
        // this unloads flash etc, because the user is not viewing the YT video (e.g.) anymore
        $(this).html('');
      });
    }
    
    this.$el.smoothScrollTop();
    
    return false;
  }
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
    $.get("/api/update_feeds", function(responseData) {
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
    
    "click #btn-refresh": "updateAndRefresh",
    
    'click #modal-delete-feed .btn-delete': 'deleteFeedConfirmed'
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
          // clear input value
          $("#input-add-feed").val("");
          // enable controls again
          $("#modal-add-feed input, #modal-add-feed .btn").removeAttr('disabled');
          
          self.refresh();
        },
        // Server-side guy messed up again
        error: function(model, xhr, options) {
          alert(xhr.responseJSON.message);
          
          // enable controls again
          $("#modal-add-feed input, #modal-add-feed .btn").removeAttr('disabled');
        }
      });
      
    }
    
    return false;
  },
  
  deleteFeedConfirmed: function() {
    var model = $("#modal-delete-feed").data('feed-model');
    // delete
    model.destroy({
      success: function() {
        $("#modal-delete-feed").modal('hide');
      },
      error: function() {
        alert("An error occured. The feed may not be deleted.");
      }
    })
    
    return false;
  }
  
  
});
var WindowView = Backbone.View.extend({
  el: $(window),
  
  events: {
    'scroll': 'onScroll'
  },
  
  initialize: function() {
    // load the app
    var App = new AppView;
  },
  
  onScroll: function() {
    // pixels from bottom
    var offsetFromBottom = $(document).height() - ( this.$el.scrollTop() + this.$el.height() );
    
    if ( offsetFromBottom < 100 ) { // 100px before bottom of page -> load!
      
      var feedMenuView = $("#feed-menu-view").data('view'); // get the current view responsible for rendering the items
      
      if ( feedMenuView ) { // if we have a view
        
        if ( $(feedMenuView.nextButton).css('display') != 'none' ) { // if the view's button is displayed (i.e. we have another page to load)
          feedMenuView.addNextPage(); // load the page!
        }
        
      }
      
    }
  }
});

var Window = new WindowView;
