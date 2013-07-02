require 'sinatra/base'
require 'sinatra/activerecord'
require 'sinatra/config_file'

require 'will_paginate'
require 'will_paginate/active_record'

require 'rufus/scheduler'

require 'feedzirra'

require 'json'

Dir[File.join(".", "models/*.rb")].each do |f|
  require f
end


class Feedo < Sinatra::Base
  register Sinatra::ActiveRecordExtension
  register Sinatra::ConfigFile
  
  config_file 'config/feedo.yml'
  
  
  def self.logger
    @@logger
  end
  
  def self.scheduler
    @@scheduler
  end
  
  configure do
    @@scheduler = Rufus::Scheduler.start_new
    @@logger = Logger.new(STDOUT)
  
    if settings.use_internal_scheduler then
      @@scheduler.every settings.scheduler_interval, :allow_overlapping => false do
        ActiveRecord::Base.verify_active_connections!
        update_feeds
      end
    end
  
    ActiveRecord::Base.include_root_in_json = false
    
    @@scheduler.in "2s" do
      update_feeds
    end
  end
  
  def self.update_feeds
    @@logger.info "Starting to check the Feeds..."
    
    Feed.all.each do |feed|
      feed.update_feed
      
    end
    ActiveRecord::Base.connection.close
    
    @@logger.info "Finished checking Feeds!"
  end
  
  get '/' do
    File.read(File.join('public', 'index.html'))
  end
  
  get '/feeds/:id' do
    feed = Feed.find(params[:id])
    
    content_type :json
    feed.to_json
  end
  
  get '/feeds' do
    feeds = Feed.all
    
    content_type :json
    feeds.to_json
  end
  
  post '/feeds' do
    url = JSON.parse(request.body.read)["file_url"]
    
    return 400 if url.nil? or url.empty? 
        
    return 409 if Feed.where(:file_url => url).exists?
    
    feed = Feed.new
    feed.file_url = url
    feed.save
    
    feed.update_feed
    
    content_type :json
    feed.to_json
  end
  
  get '/feeds/:id/items' do    
    feed_items = FeedItem.where(:feed_id => params[:id]).order("published DESC").paginate(:page => params[:page], :per_page => params[:perPage])
    
    content_type :json
    feed_items.to_json
  end
  
  get '/feeds/:feed_id/items/:item_id' do
    feed_item = FeedItem.find(params[:item_id])
    puts feed_item.published
    content_type :json
    feed_item.to_json
  end
  
  put '/feeds/:feed_id/items/:item_id' do
    data = JSON.parse(request.body.read)
    
    feed_item = FeedItem.find(params[:item_id])
    
    return 404 if feed_item.nil?
    
    feed_item.read = data["read"]
    
    feed_item.save!
    feed_item.to_json
  end
  
  get '/update_feeds' do
    Feedo::update_feeds
    "updated"
  end
  
  delete '/feeds/:id' do
    Feed.destroy(params[:id])
    
    {}.to_json
  end
  
  not_found do
    erb :'404'
  end
end