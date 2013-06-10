require 'sinatra/base'
require 'sinatra/activerecord'

require 'rufus/scheduler'

require 'feedzirra'

require 'json'

Dir[File.join(".", "models/*.rb")].each do |f|
  require f
end


class Feedo < Sinatra::Base
  register Sinatra::ActiveRecordExtension
  
  ActiveRecord::Base.include_root_in_json = false
  
  SCHEDULER = Rufus::Scheduler.start_new
  
  SCHEDULER.every '1m' do
    ActiveRecord::Base.verify_active_connections!
    update_feeds
  end
  
  def self.update_feeds
    puts "Starting to check the Feeds..."
    
    Feed.all.each do |feed|
      feed.update_feed
      
    end
    ActiveRecord::Base.connection.close
    
    puts "Finished checking Feeds!"
  end
  
  get '/' do
    File.read(File.join('public', 'index.html'))
  end
  
  delete '/feeds/:id' do
    Feed.delete(params[:id])
    
    redirect '/'
  end
  
  get '/feeds/:id' do
    feed = Feed.find(params[:id])
    
    content_type :json
    feed.to_json
  end
  
  get '/feeds' do
    feeds = Feed.all
    
    content_type :json
    feeds.to_json(:include => {:feed_items => {:only => :id}})
  end
  
  post '/feeds' do
    url = URI.unescape(params[:url])
    if(url.empty?) then return "empty" end
    exists = Feed.where(:file_url => url).exists?
    
    if exists then
      return "exists"
    end
    
    feed = Feed.new
    feed.file_url = url
    feed.save
    
    feed.update_feed
    
    feed.to_json
  end
  
  get '/feeds/:id/items' do
    feed = Feed.find(params[:id])
    
    content_type :json
    feed.feed_items.to_json
  end
  
  get '/update_feeds' do
    Feedo::update_feeds
    "updated"
  end
  
  not_found do
    erb :'404'
  end
end