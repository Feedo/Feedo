require 'pismo'

class Feed < ActiveRecord::Base
  attr_accessible :file_url, :title, :link, :description, :favicon_url
  has_many :feed_items
  
  validates :file_url, :presence => true
  
  before_destroy :delete_items
  
  def update_feed
    begin     
      Feedo.logger.info "Checking "+self.file_url+"..."
      feedzirra = Feedzirra::Feed.fetch_and_parse(self.file_url)
      
      self.title = feedzirra.title
      self.link = feedzirra.url
      self.description = feedzirra.description
      
      # fetch the favicon
      doc = Pismo::Document.new(self.link)
      
      self.favicon_url = doc.favicon unless doc.favicon.nil?
      self.favicon_url = self.link + "/favicon.ico" if doc.favicon.nil?
      
      feedzirra.entries.each do |entry|
        FeedItem.insert_or_update(self, entry)
      end
      save!
      Feedo.logger.info "Checked "+self.file_url+"."
    
    rescue Exception => e
      Feedo.logger.error "#{self.file_url} is invalid! #{e}"
    end
  end
  
  private
    def delete_items
      FeedItem.where(:feed_id => id).destroy_all
    end
end