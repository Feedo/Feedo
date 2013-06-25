class FeedItem < ActiveRecord::Base
  attr_accessible :title, :content, :summary, :image, :published, :link, :author, :item_guid
  belongs_to :feed
  
  def self.insert_or_update(feed, feedzirra_entry)
    target = FeedItem.where(:feed_id => feed.id, :item_guid => feedzirra_entry.entry_id).first
    update = true
    
    if(target == nil) then
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
    
    target.save 
  end
end