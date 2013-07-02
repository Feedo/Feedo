require 'pismo'
require 'open-uri' 

class Feed < ActiveRecord::Base
  attr_accessible :file_url, :title, :link, :description, :favicon_url
  has_many :feed_items
  
  validates :file_url, :presence => true
  
  before_destroy :delete_items
  
  def update_feed   
    feedzirra = Feedzirra::Feed.fetch_and_parse(self.file_url)
    
    self.title = feedzirra.title
    self.link = feedzirra.url
    self.description = feedzirra.description
    
    if !self.link.nil? then
      # fetch the favicon
      doc = Pismo::Document.new(self.link)
    
      self.favicon_url = doc.favicon unless doc.favicon.nil?
      self.favicon_url = self.link + "/favicon.ico" if doc.favicon.nil?
    end
    # we need to handle yahoo pipes specially here
    if (self.favicon_url.nil? or !file_url_exists(self.favicon_url) or self.link.include?("pipes.yahoo")) then
      self.favicon_url = "img/feed-icon.png"
    end
    
    feedzirra.entries.each do |entry|
      FeedItem.insert_or_update(self, entry)
    end
    save!
  end
  
  private
    def delete_items
      FeedItem.where(:feed_id => id).destroy_all
    end
    
    def file_url_exists(url)
      open(url).status[0] == "200"
    end
end