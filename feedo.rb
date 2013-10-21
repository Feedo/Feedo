require 'sinatra/base'
require 'sinatra/activerecord'
require 'sinatra/config_file'
require 'sinatra/assetpack'

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
  register Sinatra::AssetPack
  
  set :root, File.dirname(__FILE__)
  
  config_file 'config/feedo.yml'
  set :database_file, 'config/database.yml'
  
  assets {
    serve '/js', from: 'app/js'
    serve '/css', from: 'app/css'
    serve '/img', from: 'app/img'
    
    js :libs, '/js/libs.js', [
      '/js/libs/underscore.js',      
      '/js/libs/jquery-1.10.1.js',
      '/js/libs/backbone.js',
      '/js/libs/spin.min.js',
      '/js/libs/*.js',
    ]
    
    js :app, '/js/app.js', [
      '/js/*.js'
    ]
    
    css :application, '/css/application.css', [
      '/css/*.css'
    ]
    
    prebuild true
  }
  
  def self.logger
    @@logger
  end
  
  def self.scheduler
    @@scheduler
  end
  
  ActiveRecord::Base.logger.level = 1
  
  helpers do
    def protected!
      return if authorized? or !settings.auth_enabled
      headers['WWW-Authenticate'] = 'Baseic realm="Restricted Area"'
      halt 401, "Not Authorized"
    end
    
    def authorized?
      @auth ||= Rack::Auth::Basic::Request.new(request.env)
      @auth.provided? and @auth.basic? and @auth.credentials and @auth.credentials == [settings.auth_username, settings.auth_password]
    end
  end
  
  configure do    
    @@scheduler = Rufus::Scheduler.start_new
    @@logger = Logger.new(STDOUT)
  
    if settings.use_internal_scheduler then
      @@scheduler.every settings.scheduler_interval, :allow_overlapping => false do
        ActiveRecord::Base.verify_active_connections!
        update_feeds do |progress, total|
          
        end
      end
    end
  
    ActiveRecord::Base.include_root_in_json = false
    
    @@scheduler.in "2s" do
      update_feeds do |progress, total|
          
      end
    end
  end
  
  def self.update_feeds
    @@logger.info "Starting to check the Feeds..."
    i = 0
    feeds = Feed.all
    feeds.each do |feed|
      begin
        Feedo.logger.info "Checking #{feed.file_url}..."
        
        feed.update_feed
        yield i, feeds.size
        i = i + 1
        Feedo.logger.info "Checked #{feed.file_url}"   
        
      rescue Exception => e
        @@logger.error "#{feed.file_url} is invalid! #{e}"
      end
      
    end
    ActiveRecord::Base.connection.close
    
    @@logger.info "Finished checking Feeds!"
  end
  
  
  def event_message(name, data)
   "event: #{name}\ndata: #{data}\n\n"
  end
  
  get '/api/update_feeds' do
    protected!
    content_type 'text/event-stream'
    
    stream do |out|
      out << event_message("starting_update", {}.to_json)

      Feedo::update_feeds do |current, all|
        out << event_message("feed_updated", {:progress => current + 1, :total => all}.to_json)
      end
      
      out << event_message("updating_finished", {}.to_json)
    end
  end
  
  get '/api/feeds/:id' do
    protected!
    feed = Feed.find(params[:id])
    
    content_type :json
    feed.to_json
  end
  
  get '/api/feeds' do
    protected!
    feeds = Feed.all
    
    content_type :json
    feeds.to_json
  end
  
  post '/api/feeds' do
    protected!
    url = JSON.parse(request.body.read)["file_url"]
    
    content_type :json
    
    return 400, {:message => "Please specify an URL!"}.to_json if url.nil? or url.empty? 
        
    return 409, {:message => "The Feed was already added."}.to_json if Feed.where(:file_url => url).exists?
    
    feed = Feed.new
    feed.file_url = url
    feed.save
    
    begin
      feed.update_feed
    rescue Exception => e
      Feed.destroy(feed)
      @@logger.error "Invalid feed! #{e}"
      return 400, {:message => "The Feed seems to be invalid."}.to_json
    end
    feed.to_json
  end
  
  get '/api/feeds/:id/items' do
    protected!
    feed_items = FeedItem.where(:feed_id => params[:id]).order("published DESC").paginate(:page => params[:page], :per_page => params[:perPage])
    
    content_type :json
    feed_items.to_json
  end
  
  get '/api/feeds/:feed_id/items/:item_id' do
    protected!
    feed_item = FeedItem.find(params[:item_id])
    puts feed_item.published
    content_type :json
    feed_item.to_json
  end
  
  put '/api/feeds/:feed_id/items/:item_id' do
    protected!
    data = JSON.parse(request.body.read)
    
    feed_item = FeedItem.find(params[:item_id])
    
    return 404 if feed_item.nil?
    
    feed_item.read = data["read"]
    
    feed_item.save!
    feed_item.to_json
  end
  
  delete '/api/feeds/:id' do
    protected!
    Feed.destroy(params[:id])
    
    {}.to_json
  end
  
  get '/api/info' do
    protected!
    "FEEDO"
  end
  
  get '/*' do
    protected!
    erb :index
  end
  
  not_found do
    erb :'404'
  end
end