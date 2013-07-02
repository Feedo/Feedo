class FeedItem < ActiveRecord::Base
  attr_accessible :title, :content, :summary, :image, :published, :link, :author, :item_guid, :read
  belongs_to :feed
  
  after_save :update_feed_has_unread
  
  def self.insert_or_update(feed, feedzirra_entry)
    target = FeedItem.where(:feed_id => feed.id, :item_guid => feedzirra_entry.entry_id).first
    target = FeedItem.where(:feed_id => feed.id, :published => feedzirra_entry.published).first if target.nil?
    
    update = true
    
    if target.nil? then
      update = false
      target = FeedItem.new
    end

    target.feed_id = feed.id
    target.title = feedzirra_entry.title.to_s
    target.link = feedzirra_entry.url.to_s
    target.author = feedzirra_entry.author.to_s
    target.summary = feedzirra_entry.summary.to_s
    target.content = feedzirra_entry.content.to_s
    target.published = feedzirra_entry.published
    target.image = feedzirra_entry.image unless !feedzirra_entry.respond_to?('image')
    target.item_guid = feedzirra_entry.entry_id.to_s
    
    
    target.read = update ? target.read : false
    
    feed.has_unread = true if !target.read
    
    feed.save
    
    target.save 
  end
  
  private
    def update_feed_has_unread
      feed = Feed.find(self.feed_id)
      
      feed_items_unread = FeedItem.where(:feed_id => feed.id, :read => false)
      
      if feed_items_unread.size > 0 then
        feed.has_unread = true
      else
        feed.has_unread = false
      end
      feed.save
    end
end