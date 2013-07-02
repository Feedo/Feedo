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
    
    if settings.auth_enabled then
      use Rack::Auth::Basic, "Restricted Area" do |username, password|
        username == settings.auth_username and password == settings.auth_password
      end
    end
  end
  
  def self.update_feeds
    @@logger.info "Starting to check the Feeds..."
    
    Feed.all.each do |feed|
      begin
        Feedo.logger.info "Checking #{feed.file_url}..."
        
        feed.update_feed
        
        Feedo.logger.info "Checked #{feed.file_url}"   
        
      rescue Exception => e
        @@logger.error "#{feed.file_url} is invalid! #{e}"
      end
      
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
    
    return 400, {:message => "Please specify an URL!"}.to_json if url.nil? or url.empty? 
        
    return 409, {:message => "The Feed was already added."}.to_json if Feed.where(:file_url => url).exists?
    
    feed = Feed.new
    feed.file_url = url
    feed.save
    
    begin
      feed.update_feed
    rescue
      Feed.destroy(feed)
      return 400, {:message => "The Feed seems to be invalid."}.to_json
    end
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