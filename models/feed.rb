class Feed < ActiveRecord::Base
  has_many :feed_items
  
  def update_feed      
    Feedo.logger.info "Checking "+self.file_url+"..."
    feedzirra = Feedzirra::Feed.fetch_and_parse(self.file_url)
    self.title = feedzirra.title
    self.link = feedzirra.url
    self.description = feedzirra.description
    
    feedzirra.entries.each do |entry|
      FeedItem.insert_or_update(self, entry)
    end
    Feedo.logger.info "Checked "+self.file_url+"."
    save!    
  end
end