class Feed < ActiveRecord::Base
  attr_accessible :file_url, :title, :link, :description
  has_many :feed_items
  
  validates :file_url, :presence => true
  
  def update_feed
    begin     
      Feedo.logger.info "Checking "+self.file_url+"..."
      feedzirra = Feedzirra::Feed.fetch_and_parse(self.file_url)
      self.title = feedzirra.title
      self.link = feedzirra.url
      self.description = feedzirra.description
    
      feedzirra.entries.each do |entry|
        FeedItem.insert_or_update(self, entry)
      end
      save!
      Feedo.logger.info "Checked "+self.file_url+"."
    
    rescue
      Feedo.logger.error "#{self.file_url} is invalid!"
    end
  end
end